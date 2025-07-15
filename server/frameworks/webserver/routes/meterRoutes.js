const { Hono } = require("hono");
const { addMeter ,getMeter} = require("../../../adapters/controllers/meterController");

const appMeter = new Hono()


appMeter.post('/add-meter', addMeter)

appMeter.get('/get-meter', getMeter)

module.exports = appMeter