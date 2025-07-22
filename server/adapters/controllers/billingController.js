
const { handleRequestError } = require("../../frameworks/webserver/utils/HOCHandelRequest")
const { getDataBillingRepo, BillingCategory, BillSave, updateMeter, updateMeterHistory } = require("../repositories/billing/billingRepo")
const { ListBill } = require("../repositories/billing/billingRepoII")
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