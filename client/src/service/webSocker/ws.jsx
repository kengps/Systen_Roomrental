// hooks/useNotificationSocket.js
import { useState, useEffect, useCallback } from 'react';
import { notification as antdNotification } from 'antd';
import { notificationSocket } from '../services/socketService';

export const useNotificationSocket = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect socket
        notificationSocket.connect();

        // Event handlers
        const handleConnect = () => {
            console.log('Socket connected');
            setIsConnected(true);

            // Join user's room
            const userId = localStorage.getItem('userId'); // หรือจาก auth context
            if (userId) {
                notificationSocket.joinUserRoom(userId);
            }
        };

        const handleDisconnect = () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        };

        const handleNewNotification = (newNotification) => {
            console.log('New notification received:', newNotification);

            // Add to notifications list
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            antdNotification.info({
                message: newNotification.title,
                description: newNotification.body,
                placement: 'topRight',
                duration: 4.5,
            });
        };

        // Register event listeners
        notificationSocket.onConnect(handleConnect);
        notificationSocket.onDisconnect(handleDisconnect);
        notificationSocket.onNotification(handleNewNotification);

        // Load initial notifications
        loadNotifications();

        // Cleanup
        return () => {
            notificationSocket.cleanup();
            notificationSocket.disconnect();
        };
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read: true }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await fetch('/api/notifications/mark-all-read', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, []);

    const refreshNotifications = useCallback(() => {
        loadNotifications();
    }, []);

    return {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        refreshNotifications
    };
};

// services/socketService.js
import { io } from 'socket.io-client';

class NotificationSocketService {
    constructor() {
        this.socket = null;
        this.isInitialized = false;
    }

    connect() {
        if (this.isInitialized) return;

        this.socket = io(process.env.VITE_REACT_APP_SOCKET_URL || 'http://localhost:3001', {
            autoConnect: false,
            transports: ['websocket', 'polling']
        });

        this.isInitialized = true;
        this.socket.connect();
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isInitialized = false;
        }
    }

    joinUserRoom(userId) {
        if (this.socket) {
            this.socket.emit('join', userId);
        }
    }

    // Event listeners
    onConnect(callback) {
        if (this.socket) {
            this.socket.on('connect', callback);
        }
    }

    onDisconnect(callback) {
        if (this.socket) {
            this.socket.on('disconnect', callback);
        }
    }

    onNotification(callback) {
        if (this.socket) {
            this.socket.on('notifications', callback);
        }
    }

    // Cleanup all listeners
    cleanup() {
        if (this.socket) {
            this.socket.off('connect');
            this.socket.off('disconnect');
            this.socket.off('notifications');
        }
    }

    // Get connection status
    isConnected() {
        return this.socket?.connected || false;
    }
}

// Export singleton instance
export const notificationSocket = new NotificationSocketService();


import { Drawer, List, Button } from 'antd';

const NotificationDrawer = ({
    visible,
    onClose,
    notifications,
    unreadCount,
    onNotificationClick,
    onMarkAllRead
}) => {
    return (
        <Drawer
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            type="link"
                            size="small"
                            onClick={onMarkAllRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
            }
            placement="right"
            onClose={onClose}
            open={visible}
            width={400}
        >
            <List
                dataSource={notifications}
                locale={{ emptyText: 'No notifications' }}
                renderItem={(notification) => (
                    <List.Item
                        style={{
                            backgroundColor: notification.read ? 'transparent' : '#f0f9ff',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            padding: '12px'
                        }}
                        onClick={() => onNotificationClick(notification)}
                    >
                        <List.Item.Meta
                            title={
                                <div style={{
                                    fontWeight: notification.read ? 'normal' : 'bold',
                                    color: notification.read ? '#666' : '#000'
                                }}>
                                    {notification.title}
                                </div>
                            }
                            description={
                                <div>
                                    <div style={{ marginBottom: '4px' }}>
                                        {notification.body}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#999',
                                        marginTop: '4px'
                                    }}>
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            }
                        />
                        {!notification.read && (
                            <div
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#1890ff',
                                    borderRadius: '50%',
                                    marginLeft: '8px'
                                }}
                            />
                        )}
                    </List.Item>
                )}
            />
        </Drawer>
    );
};

export default NotificationDrawer;