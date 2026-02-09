// ใน Payment Controller - เมื่อลูกค้าอัปโหลดสลิป

const { NotificationsRepository } = require("../repositories/noti");






exports.uploadPaymentSlip = (payment) => {
    console.log(`⩇⩇:⩇⩇🚨 ~ payment :`, payment);

    try {



        // 🔔 ส่ง notification ให้ landlord
        // await NotificationService.paymentWaiting(payment);

        // res.json({ success: true, payment });
    } catch (error) {
        // handle error
    }
}


exports.markAsRead = async (c) => {
    const { id } = await c.req.param()

    const data = await NotificationsRepository.readNotifications(id)


    return c.json({ success: true, data })
}
exports.markAllAsRead = async (c) => {

    const req = c.get('user')

    const data = await NotificationsRepository.readAllNotifications(req.id)


    return c.json({ success: true, data })
}