const helmet = require('helmet')
const { Hono } = require('hono')

const appHelmet = new Hono()

const helmetMiddleware = helmet() // สร้าง middleware ตัวเดียว

appHelmet.use('*', (c, next) => {
    return new Promise((resolve, reject) => {
        helmetMiddleware(c.req.raw, c.res.raw, (err) => {
            if (err) reject(err)
            else resolve(next())
        })
    })
})

module.exports = appHelmet
