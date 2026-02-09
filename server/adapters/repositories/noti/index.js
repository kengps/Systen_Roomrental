
const { default: NotificationModel } = require("../../../frameworks/database/mongoDB/models/apartments/notifications");



class NotificationsRepository {
    // constructor() {
    //     this.NotificationsModel = NotificationModel
    // }



    static async readNotifications(id) {
        const data = await NotificationModel.findOneAndUpdate(
            { _id: id },
            { $set: { isRead: true } },
            { new: true }

        )
        // if (!data) return sendError('ไม่พบ', 'id')
        return data
    }
    static async readAllNotifications(id) {
        const data = await NotificationModel.updateMany(
            { 'recipient.userId': id },
            { $set: { isRead: true } },
            { new: true }

        )
        // if (!data) return sendError('ไม่พบ', 'id')
        return data
    }
}

module.exports = { NotificationsRepository }