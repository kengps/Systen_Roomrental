const { cors } = require('hono/cors')
const { Hono } = require('hono')

const appCors = new Hono()

// ใช้ cors middleware จาก npm

// appCors.use('*', cors({
//   origin: '*', // หรือกำหนดโดเมนที่ต้องการ
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// }))


appCors.use('*', cors({
  origin: 'http://localhost:8001', // ✅ ระบุ origin ของ frontend
  credentials: true,               // ✅ อนุญาตส่ง cookie
  allowHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))


module.exports = appCors