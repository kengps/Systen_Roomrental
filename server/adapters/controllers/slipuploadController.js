



const { default: mongoose } = require("mongoose");
const { default: NotificationModel } = require("../../frameworks/database/mongoDB/models/apartments/notifications");
const { Bill } = require("../../frameworks/database/mongoDB/models/bill/bill");
const slip = require("../../frameworks/database/mongoDB/models/bill/slip");
const { checkSlipOK } = require("../../frameworks/services/checkSlipOK");
const { generateKey } = require("../../frameworks/services/generateKey");
const { sendError } = require("../../frameworks/webserver/utils/responseMessage");
const { findBankNumber } = require("../repositories/apartment");
const Tenant = require("../../frameworks/database/mongoDB/models/tenant");
const { findOwner } = require("../repositories/register");



exports.saveSlip = async (data) => {
    try {
        // เช็ค slip ซ้ำ
        const slipIsExits = await slip.findOne({ transRef: data.data.transRef });





        if (slipIsExits) {
            return slipIsExits
            //  return sendError("ซ้ำ", "slip");
        }

        // ✅ ประกอบข้อมูลใหม่ให้ตรง schema
        const slipPayload = {
            apartment: data.apartment, // ส่งมาจาก request
            tenant: data.tenant,       // ส่งมาจาก request
            success: data.data.success,
            message: data.data.message,
            transRef: data.data.transRef,
            sendingBank: data.data.sendingBank,
            receivingBank: data.data.receivingBank,
            transDate: data.data.transDate,
            transTime: data.data.transTime,
            transTimestamp: data.data.transTimestamp,
            sender: data.data.sender,
            receiver: data.data.receiver,
            amount: data.data.amount,
            paidLocalAmount: data.data.paidLocalAmount,
            paidLocalCurrency: data.data.paidLocalCurrency,
            countryCode: data.data.countryCode,
            transFeeAmount: data.data.transFeeAmount,
            ref1: data.data.ref1,
            ref2: data.data.ref2,
            ref3: data.data.ref3,
            toMerchantId: data.data.toMerchantId,
            qrcodeData: data.data.qrcodeData,
        };

        // ✅ Save
        const slipOK = new slip(slipPayload);

        const result = await slipOK.save();

        return result


    } catch (error) {
        throw error;
    }
}

// exports.saveSlips = async (c) => {
//     try {
//         const data = await c.req.json()


//         const result = await exports.saveSlips(data);

//         return c.json(result)

//     } catch (error) {
//         throw error
//     }

// }



exports.checkSlip = async (c) => {
    try {
        const { accountId, accountNumber, attachments, billId, tenant } = await c.req.json();

        // ขั้นตอนแรก ตรวจสอบข้อมูล API_KEY BRANCH_ID จากข้อมูล bank
        const bank = await findBankNumber(accountNumber);


        // ขั้นตอนที่ 2 checkslip
        const result = await checkSlipOK(bank.API_KEY, bank.BRANCH_ID, attachments);



        // ขั้นตอนที่ 3 ใส่ข้อมูล apartmentId และ tenant
        result.apartment = bank.apartmentId;
        result.tenant = tenant;
        const slip = await exports.saveSlip(result);

        await Bill.findByIdAndUpdate(
            { _id: billId },
            { $set: { slip: slip._id } }
        );

        await SubmitLogs(
            {
                ipAddress: 0 || '',
                action: "checkSlip",
                actor: accountId,
                details: slip
            }
        )




        return c.json({ status: 201, message: 'check slip completed', slip });
    } catch (error) {
        console.error("🚨 Controller error:", error);

        const statusCode = error.status || 400;
        return c.json(
            {
                status: statusCode,
                message: error.message || 'Unknown error',
                type: error.type || 'GENERAL'
            },
            statusCode
        );
    }
};


exports.fullkey = async (c) => {
    const start = Date.now(); // ⏱ เริ่มจับเวลา

    const key = generateKey();

    const end = Date.now(); // ⏱ จบเวลา
    const duration = end - start;

    return c.json({
        status: 201,
        message: 'check slip completed',
        key,
        duration: `${duration} ms`
    });
}




exports.getNotifications = async (c) => {

    try {
        const user = c.get('user') // ได้จาก authMiddleware

        const userId = user.id
        const userType = user.role



        const limit = Number(c.req.query('limit') || '10')
        const page = Number(c.req.query('page') || '1')
        const skip = (page - 1) * limit

        const [notifications, total, unreadCount] = await Promise.all([


            NotificationModel.find({
                'recipient.userId': userId,
                // 'recipient.tenantId': userId,
                'recipient.userType': userType,
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            NotificationModel.countDocuments({
                'recipient.userId': userId,
                // 'recipient.tenantId': userId,
                'recipient.userType': userType,
            }),

            NotificationModel.countDocuments({
                'recipient.userId': userId,
                // 'recipient.tenantId': userId,
                'recipient.userType': userType,
                isRead: false,
            }),
        ])



        return c.json({
            success: true,
            data: {
                notifications,
                total,
                unreadCount,
            },
        })
    } catch (err) {
        console.error('getNotifications error:', err)
        return c.json({ success: false, message: 'Server error' }, 500)
    }
}
