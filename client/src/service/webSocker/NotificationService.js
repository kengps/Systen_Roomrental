import { io } from 'socket.io-client';

class NotificationService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
        this.userId = null; // ← เพิ่มตัวแปรเก็บ userId

        // ✅ เพิ่ม Audio สำหรับเสียง notification
        this.notificationSound = null;
        this.soundEnabled = true;
        this.initializeSound();
    }

    // ✅ เตรียม Audio file
    initializeSound() {
        try {
            // Option 1: ใช้ไฟล์เสียงที่อยู่ใน public folder
            this.notificationSound = new Audio('/sounds/bell-ringing-05.wav');

            // Option 2: ใช้ online sound (สำหรับ demo)
            // this.notificationSound = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav');

            // ตั้งค่าเสียง
            this.notificationSound.volume = 0.5; // ปรับระดับเสียง 0.0 - 1.0
            this.notificationSound.preload = 'auto';
        } catch (error) {
            console.warn('🔇 Could not initialize notification sound:', error);
        }
    }

    initialize(serverUrl = `${import.meta.env.VITE_REACT_APP_SOCKET_URL}`) {
        if (this.socket) {
            return this.socket;
        }

        this.socket = io(serverUrl, {
            autoConnect: false // ← เปลี่ยนกลับเป็น false เพื่อรอ userId
        });

        this.setupEventListeners();
        return this.socket;
    }

    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ Socket Connected! Socket ID:', this.socket.id);
            this.isConnected = true;

            // ใช้ token แทน userId
            const token = localStorage.getItem('token');
            console.log('🔐 Token from localStorage:', token ? 'Found' : 'Not found');

            // if (token) {
            //     this.socket.emit('authenticate', token); // ← ส่ง token ไป verify
            //     console.log('🔐 Sent authentication token');
            // } else 
            if (this.userId) {
                // Fallback: ใช้ userId ที่ส่งมาจาก parameter
                this.socket.emit('join', this.userId);
                console.log('🏠 Sent join request for userId:', this.userId);
            } else {
                console.error('❌ No token or userId found!');
            }

            this.emit('connect');
        });

        // เพิ่ม event สำหรับ authentication
        this.socket.on('authenticated', (userData) => {
            console.log('✅ Authentication successful:', userData);
            this.userId = userData.userId; // เก็บ userId ใน memory
            this.emit('authenticated', userData);
        });

        this.socket.on('authentication_failed', (error) => {
            console.error('❌ Authentication failed:', error);
            this.emit('authentication_failed', error);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket Disconnected');
            this.isConnected = false;
            this.emit('disconnect');
        });

        this.socket.on('notifications', (notification) => {
            console.log('📨 NEW NOTIFICATION FROM SERVER:', notification);
            // ✅ เล่นเสียง notification
            this.playNotificationSound();

            this.emit('notifications', notification);
        });

        this.socket.on('joined', (data) => {
            console.log('✅ Successfully joined room:', data);
        });

        this.socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
            this.emit('error', error);
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔥 Connection failed:', error);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('🔥 Reconnection failed:', error);
        });
    }

    // ✅ Method รับ userId และเชื่อมต่อ
    connect(userId = null) {
        if (userId) {
            this.userId = userId; // เก็บ userId ไว้
        }

        if (this.socket && !this.isConnected) {
            this.socket.connect();
        }
    }

    disconnect() {
        if (this.socket && this.isConnected) {
            this.socket.disconnect();
        }
    }

    // Event listener management
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        return () => {
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                eventListeners.delete(callback);
            }
        };
    }

    off(event, callback) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
        }
    }

    emit(event, data) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    send(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot send:', event, data);
        }
    }

    joinRoom(roomId) {
        this.send('join', roomId);
    }

    leaveRoom(roomId) {
        this.send('leave', roomId);
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            socketId: this.socket?.id || null,
            userId: this.userId
        };
    }
    // ✅ เล่นเสียง notification
    playNotificationSound() {
        if (this.soundEnabled && this.notificationSound) {
            try {
                // Reset audio to beginning
                this.notificationSound.currentTime = 0;
                this.notificationSound.play().catch(error => {
                    console.warn('🔇 Could not play notification sound:', error);
                });
            } catch (error) {
                console.warn('🔇 Notification sound error:', error);
            }
        }
    }

    // ✅ เปิด/ปิดเสียง
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        console.log(`🔊 Notification sound ${enabled ? 'enabled' : 'disabled'}`);
    }

    // ✅ ปรับระดับเสียง
    setVolume(volume) {
        if (this.notificationSound) {
            this.notificationSound.volume = Math.max(0, Math.min(1, volume));
            console.log(`🔊 Volume set to: ${this.notificationSound.volume}`);
        }
    }

    // ✅ เปลี่ยนเสียง notification
    changeNotificationSound(soundUrl) {
        try {
            this.notificationSound = new Audio(soundUrl);
            this.notificationSound.volume = 0.5;
            this.notificationSound.preload = 'auto';
            console.log('🔊 Notification sound changed to:', soundUrl);
        } catch (error) {
            console.error('🔇 Could not change notification sound:', error);
        }
    }

    destroy() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.listeners.clear();
        this.isConnected = false;
        this.userId = null;
    }
}

const notificationService = new NotificationService();
export default notificationService;