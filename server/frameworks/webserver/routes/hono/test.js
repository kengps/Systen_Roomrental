
const { Hono } = require('hono')

const appHonoTest = new Hono()


appHonoTest.get('/test', async (c) => c.text('eiei'))
appHonoTest.get('/test2', async (c) => c.text('eiei2'))

module.exports = appHonoTest