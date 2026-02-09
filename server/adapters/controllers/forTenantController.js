const { NotificationService } = require("../../frameworks/database/mongoDB/models/apartments/notifications")
const { handleRequestError } = require("../../frameworks/webserver/utils/HOCHandelRequest")
const { sendResponseHono } = require("../../frameworks/webserver/utils/responseMessage")
const { SubmitLogs } = require("../repositories/logactions/logactionsRepository")
const { findOwner } = require("../repositories/register")
const { informationApartmentForTenants, ListBillingTenant, SavePayments } = require("../repositories/tenant/tanantReposit")



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
exports.PayMentsTenant = handleRequestError(async (c) => {

    const body = await c.req.json()


    const billings = await SavePayments(body)

    await NotificationService.paymentWaiting(billings.payment, billings.check)

    await SubmitLogs(
        {
            ipAddress: 0 || '',
            action: "PayMentsTenant",
            actor: body.tenant,
            details: billings
        }
    )


    return c.json({ status: 201, message: 'payment submit successfully', billings })


})