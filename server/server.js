require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const http = require('http')

const PORT = process.env.MY_PORT || 6000

const userRoute = require('./frameworks/webserver/routes/userRoutes');
const adminRoute = require('./frameworks/webserver/routes/adminRoutes');
const loginRoute = require('./frameworks/webserver/routes/login');

const { connectDatabases } = require('./frameworks/database/mongoDB/connectMongoose');



app.use(cors());
app.use(morgan("dev"));

// Ensure JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Router 
app.use(`/${process.env.MY_API}`, loginRoute)
app.use(`/${process.env.MY_API}/user`, userRoute)
app.use(`/${process.env.MY_API}/admin`, adminRoute)


app.post('/asdf', (req, res) => {
    console.log(`⩇⩇:⩇⩇🚨  file: server.js:28  req :`, req.body);


})


app.get('/test', (req, res) => {
    res.end('suc')
})



// app.use('/img', express.static('Frameworks/uploads'));
//connext server my port
const server = http.createServer(app);
server.listen(PORT, async () => {
    await connectDatabases();
    console.log(`server is already running on port ${PORT}`)
})