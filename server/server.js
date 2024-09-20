require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const http = require('http')

const PORT = process.env.PORT || 5050





app.use(cors());
app.use(morgan("dev"));

// Ensure JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.urlencoded({ extended: true }));



//connext server my port
const server = http.createServer(app);
server.listen(PORT , () => { console.log(`server is already running on port ${PORT}`)})