const compression = require('compression')
const { Hono } = require('hono')

const appCompression = new Hono()

// สร้าง middleware compression ตัวเดียวก่อน
const compressMiddleware = compression()

appCompression.use('*', (c, next) => {
    return new Promise((resolve, reject) => {
        compressMiddleware(c.req.raw, c.res.raw, (err) => {
            if (err) reject(err)
            else resolve(next())
        })
    })
})

module.exports = appCompression
