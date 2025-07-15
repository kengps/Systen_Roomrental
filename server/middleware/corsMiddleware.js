const { cors } = require('hono/cors')
const { Hono } = require('hono')

const appCors = new Hono()

// ใช้ cors middleware จาก npm

appCors.use('*', cors({
  origin: '*', // หรือกำหนดโดเมนที่ต้องการ
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))


module.exports = appCors