const meter = require("../../frameworks/database/mongoDB/models/apartments/meter");
const { handleRequestError } = require("../../frameworks/webserver/utils/HOCHandelRequest");
const { addMeters, getMeters } = require("../repositories/apartment/meter.rep");
const { findOwner } = require("../repositories/register");




exports.addMeter = handleRequestError(async (c) => {
    c//onst { currentMethod, ratePerUnit, meterType, apartmentId, accountId } = await c.req.json()
    const { accountId, ...meterdate } = await c.req.json()



    // const data = await addMeters(currentMethod, ratePerUnit, meterType, accountId)
    const data = await addMeters(accountId, meterdate)


    return c.json({ message: 'add meter success', data })
})
exports.getMeter = handleRequestError(async (c) => {
    c//onst { currentMethod, ratePerUnit, meterType, apartmentId, accountId } = await c.req.json()
    const { accountId, } = await c.req.query()


    // const data = await addMeters(currentMethod, ratePerUnit, meterType, accountId)
    let ownerId = await findOwner(accountId)


    if (!ownerId || Array.isArray(ownerId) && ownerId.length === 0) {
        ownerId = accountId
    }


    const data = await getMeters(ownerId)


    return c.json({ message: "get meter success", data })
})