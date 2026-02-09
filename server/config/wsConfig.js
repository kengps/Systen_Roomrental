const { Server } = require('socket.io');

let ioInstance; // ⭐️ ไว้ให้เรียกใช้นอกไฟล์นี้

const setupWebSocket = (server) => {
    console.log('🔧 Setting up WebSocket server...'); // เพิ่มบรรทัดนี้
    const io = new Server(server, {
        cors: {
            origin: '*', // ปรับตาม security จริง
            methods: ['GET', 'POST', 'PATCH']
        },
    });

    ioInstance = io; // ⭐️ เก็บไว้ใช้ภายนอก

    io.on('connection', (socket) => {
        console.log('✅ Socket connected:', socket.id);

        // ให้ client ส่ง userId มา join room
        socket.on('join', (userId) => {
            
            console.log(`👤 User joined room: ${userId}`);
            socket.join(userId); // เข้าห้องตาม userId
        });

        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });

        socket.on('logout', async (userId) => {
            try {
                // ถ้ามี Account model ก็ logout ตรงนี้ได้
                console.log(`🔒 User ${userId} logged out`);
                socket.emit('logout_success', { message: 'Logged out successfully' });
            } catch (err) {
                console.error('❌ Logout error:', err);
                socket.emit('error', { message: 'Logout failed' });
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected:', socket.id);
        });
    });

    return io;
};

// ⭐️ getter สำหรับใช้ emit นอกไฟล์
const getIo = () => ioInstance;

module.exports = {
    setupWebSocket,
    getIo,
};
