
const { handleRequestError } = require("../../frameworks/webserver/utils/HOCHandelRequest")
const { getDataBillingRepo, BillingCategory, BillSave, updateMeter } = require("../repositories/billing/billingRepo")
const { findOwner } = require("../repositories/register")


exports.getDataBilling = handleRequestError(async (c) => {
    const { accountId } = await c.req.param()

    let ownerId = await findOwner(accountId)

    if (!ownerId || Array.isArray(ownerId) && ownerId.length === 0) {
        ownerId = accountId
    }


    const resultBill = await getDataBillingRepo(ownerId)

    return c.json(resultBill)
})

exports.addBilling = handleRequestError(async (c) => {
    const {
        accountId,
        tenantId,
        apartmentId,
        billingPeriod,
        issueDate,
        dueDate,
        roomCharge,
        utilityCharges,
        otherCharges,
        discounts,
        subTotal,
        totalDiscount,
        totalAmount,
        status,
    } = await c.req.json();

    let ownerId = await findOwner(accountId)


    if (!ownerId || Array.isArray(ownerId) && ownerId.length === 0) {
        ownerId = accountId
    }


    //บันทึก
    const saveBillCategory = await BillingCategory(ownerId, tenantId, roomCharge, otherCharges)

    //บันทึกบิล
    const saveBill = await BillSave(
        accountId,
        ownerId,
        tenantId,
        apartmentId,
        billingPeriod,
        issueDate,
        dueDate,
        roomCharge,
        utilityCharges,
        otherCharges,
        discounts,
        subTotal,
        totalDiscount,
        totalAmount,
        status,)

    //update ห้อง
    await updateMeter(accountId, tenantId, utilityCharges)



    return c.json(saveBill)
})