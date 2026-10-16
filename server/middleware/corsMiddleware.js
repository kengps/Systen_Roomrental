const { cors } = require('hono/cors')
const { Hono } = require('hono')

const appCors = new Hono()

appCors.use('*', cors({
  origin: ['http://localhost:8001', 'http://localhost:5173'],
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
  exposeHeaders: ['Content-Type', 'Authorization'],
}))


module.exports = appCors