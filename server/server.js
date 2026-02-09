require('dotenv').config();
const express = require('express');
//const cors = require('cors');
const morgan = require('morgan');

const app = express();
const http = require('http')

const PORT = Number(process.env.MY_PORT) || 6000

const userRoute = require('./frameworks/webserver/routes/userRoutes');
const adminRoute = require('./frameworks/webserver/routes/adminRoutes');
const loginRoute = require('./frameworks/webserver/routes/login');
const room = require('./frameworks/webserver/routes/room');
const register = require('./frameworks/webserver/routes/registerRoutes');
const apartment = require('./frameworks/webserver/routes/apartmentRoutes');

const {connectDatabases} = require('./frameworks/database/mongoDB/connectMongoose');

// //app.use(cors());
// app.use(morgan("dev"));

// Ensure JSON body parsing
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


//Router 
// app.use(`/${process.env.MY_API}`, loginRoute)
// app.use(`/${process.env.MY_API}`, apartment)
// app.use(`/${process.env.MY_API}/user`, userRoute)
// app.use(`/${process.env.MY_API}/admin`, adminRoute)

// app.use(`/${process.env.MY_API}/admin/room`, room)
// app.use(`/${process.env.MY_API}/admin/room`, room)
// app.use(`/${process.env.MY_API}`, register)


app.post('/asdf', (req, res) => {
    console.log(`⩇⩇:⩇⩇🚨  file: server.js:28  req :`, req.body);


})


app.get('/test', (req, res) => {
    res.end('suc')
})


// app.use('/img', express.static('Frameworks/uploads'));
//connext server my port
// const server = http.createServer(app);
// server.listen(PORT, async () => {
//     await connectDatabases();
//     console.log(`server is already running on port ${PORT}`)
// })


//hono
// server.js หรือ app.js
const {Hono} = require('hono');
const {logger} = require('hono/logger');
const {etag} = require('hono/etag');
const {cors} = require('hono/cors');
const {serve} = require('@hono/node-server');
const {createNodeWebSocket} = require('@hono/node-ws');
const {serveStatic} = require('@hono/node-server/serve-static');

// Import routes
const appHonoTest = require('./frameworks/webserver/routes/hono/test');
const appLogin = require('./frameworks/webserver/routes/login');
const appApartment = require('./frameworks/webserver/routes/apartmentRoutes');
const appAccount = require('./frameworks/webserver/routes/userRoutes');
const appRooms = require('./frameworks/webserver/routes/room');
const appRegister = require('./frameworks/webserver/routes/registerRoutes');
const appCors = require('./middleware/corsMiddleware');
const appHelmet = require('./middleware/helmetMiddleware');
const appCompression = require('./middleware/compressionMiddleware');
const appMeter = require('./frameworks/webserver/routes/meterRoutes');
const appUploads = require('./frameworks/webserver/routes/uploads');
const {Readable} = require('stream');
const {setupWebSocket} = require('./config/wsConfig');
const appNotifications = require('./frameworks/webserver/routes/notificationRoutes');

// Import WebSocket configuration

const appHono = new Hono();

// WebSocket setup
const {injectWebSocket, upgradeWebSocket} = createNodeWebSocket({app: appHono});

// Apply middleware
appHono.route('*', appCors);
// appHono.use('*', (c, next) => appHelmet.handle(c.req, c.res).then(() => next()));
// appHono.use('*', (c, next) => appCompression.handle(c.req, c.res).then(() => next()));
appHono.use(etag(), logger());

// Static files
appHono.use('/img/*', serveStatic({root: '../server/frameworks/upload'}));

// Apply API routes
appHono.route('/hono', appHonoTest);
appHono.route(`/${process.env.MY_API}`, appLogin);
appHono.route(`/${process.env.MY_API}`, appApartment);
appHono.route(`/${process.env.MY_API}`, appMeter);
appHono.route(`/${process.env.MY_API}`, appAccount);
appHono.route(`/${process.env.MY_API}`, appRooms);
appHono.route(`/${process.env.MY_API}`, appRegister);
appHono.route(`/${process.env.MY_API}`, appUploads);
appHono.route(`/${process.env.MY_API}`, appNotifications);


// Basic route
appHono.get('/', (c) => c.text('Server is running!'));
appHono.get('/hono', (c) => c.text('Hono!'));


async function start() {
    try {
        await connectDatabases();
        console.log('✅ Database connected!');
        console.log(`🚀 Server is starting on port ${PORT}...`);

        const server = http.createServer(async (req, res) => {
            const url = `http://${req.headers.host}${req.url}`;
            const request = new Request(url, {
                method: req.method,
                headers: req.headers,
                body: req.method !== 'GET' && req.method !== 'HEAD' ? req : null,
                duplex: 'half',
            });

            const response = await appHono.fetch(request);
            response.headers.forEach((value, key) => res.setHeader(key, value));
            res.statusCode = response.status;

            if (response.body) {
                Readable.fromWeb(response.body).pipe(res);
            } else {
                res.end();
            }
        });

        setupWebSocket(server)

        server.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🔌 WebSocket server ready at ws://localhost:${PORT}`);
        });

        return server;
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

start();