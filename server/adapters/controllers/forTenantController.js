const { handleRequestError } = require("../../frameworks/webserver/utils/HOCHandelRequest")
const { sendResponseHono } = require("../../frameworks/webserver/utils/responseMessage")
const { findOwner } = require("../repositories/register")
const { informationApartmentForTenants, ListBillingTenant } = require("../repositories/tenant/tanantReposit")



exports.informationApartmentForTenant = handleRequestError(async (c) => {

    const { accountId } = await c.req.param()


    let ownerId = await findOwner(accountId)


    if (!ownerId || Array.isArray(ownerId) && ownerId.length === 0) {
        ownerId = accountId
    }

    const informations = await informationApartmentForTenants(ownerId)


    return c.json({ message: 'sdafasdf', informations })


})

exports.BillingTenant = handleRequestError(async (c) => {

    const { accountId } = await c.req.param()


    const billings = await ListBillingTenant(accountId)


    return sendResponseHono(c, 200, 'get billing successfully', billings)


})