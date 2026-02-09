
const { NotificationService } = require("../../frameworks/database/mongoDB/models/apartments/notifications")
const { handleRequestError } = require("../../frameworks/webserver/utils/HOCHandelRequest")
const { getDataBillingRepo, BillingCategory, BillSave, updateMeter, updateMeterHistory } = require("../repositories/billing/billingRepo")
const { ListBill, getListPayments, confirmBillAndPayment, cancelPayment } = require("../repositories/billing/billingRepoII")
const { SubmitLogs } = require("../repositories/logactions/logactionsRepository")
const { NotificationsRepository } = require("../repositories/noti")
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
        roomNumber,
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

    // หา ownerId
    let ownerId = await findOwner(accountId);
    if (!ownerId || (Array.isArray(ownerId) && ownerId.length === 0)) {
        ownerId = accountId;
    }

    try {
        // 1. บันทึก/อัปเดต Categories
        const saveBillCategory = await BillingCategory(ownerId, tenantId, roomCharge, otherCharges);




        if (!saveBillCategory.success) {
            return c.json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการสร้าง Category',
                error: saveBillCategory.error
            });
        }

        // 2. บันทึก Bill
        const saveBill = await BillSave(
            accountId,
            ownerId,
            tenantId,
            roomNumber,
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
            status
        );

        // 3. อัปเดตมิเตอร์
        await updateMeter(accountId, tenantId, billingPeriod, utilityCharges);

        //await updateMeterHistory(ownerId,accountId, tenantId, billingPeriod,utilityCharges);

        const populatedBill = await saveBill.populate(['apartment', 'tenant'])


        await NotificationService.billingWaiting(populatedBill)

        await SubmitLogs(
            {
                ipAddress: 0 || '',
                action: "addBilling",
                actor: accountId,
                details: saveBill
            }
        )




        return c.json({
            success: true,
            message: 'สร้างบิลสำเร็จ',
            data: saveBill,
            categories: saveBillCategory.allCategories
        });

    } catch (error) {
        console.error('Error in addBilling:', error);
        return c.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสร้างบิล',
            error: error.message
        });
    }
});

exports.Billing = handleRequestError(async (c) => {
    const { accountId } = await c.req.param()
    const { month, year } = await c.req.query()



    let ownerId = await findOwner(accountId);

    if (!ownerId || (Array.isArray(ownerId) && ownerId.length === 0)) {
        ownerId = accountId;
    }

    const data = await ListBill(ownerId, month, year)

    return c.json({ data })

});
exports.ListPayments = handleRequestError(async (c) => {
    const { accountId } = await c.req.param()
    const { page, limit, from } = await c.req.query()




    let ownerId = await findOwner(accountId);

    if (!ownerId || (Array.isArray(ownerId) && ownerId.length === 0)) {
        ownerId = accountId;
    }

    const data = await getListPayments(ownerId, page, limit, from)

    return c.json({ status: 200, message: 'get payment successfully', data })

});
exports.confirmPayments = handleRequestError(async (c) => {
    const { accountId, newRemainingAmount, newPaidAmount, isFullPayment, tenant, paymentId, billNumber, billId, description, reference, paymentMethod, paymentAmount } = await c.req.json()


    // ตรวจสอบ transRef ก่อน ว่ามี slipUpload แล้วหรือยัง ถ้ามีค่อย update

    const result = await confirmBillAndPayment(accountId, newRemainingAmount, newPaidAmount, isFullPayment, tenant, paymentId, billNumber, billId, description, reference, paymentMethod, paymentAmount)


    await NotificationService.paymentConfirmed(result, paymentAmount)
    await SubmitLogs(
        {
            ipAddress: 0 || '',
            action: "confirmPayments",
            actor: accountId,
            details: result
        }
    )



    return c.json(result)

});


exports.canclePayments = handleRequestError(async (c) => {
    const { accountId, tenant, billNumber, billId, description, reason, customNote, timestamp } = await c.req.json()
    const { paymentId } = await c.req.param()



    // ตรวจสอบ transRef ก่อน ว่ามี slipUpload แล้วหรือยัง ถ้ามีค่อย update

    const result = await cancelPayment(accountId, tenant, billNumber, billId, description, reason, customNote, timestamp, paymentId)


    await NotificationService.paymentRejected(result, description)

    await SubmitLogs(
        {
            ipAddress: 0 || '',
            action: "canclePayments",
            actor: accountId,
            details: result
        }
    )



    return c.json(result)

}); 