import mongoose, { Schema, model } from 'mongoose';
import { getIo } from '../../../../../config/wsConfig.js';



// ========== NOTIFICATION SCHEMA ==========
const NotificationSchema = new Schema({
    type: {
        type: String,
        enum: [
            'payment_waiting',      // รอ confirm payment
            'payment_outstanding',      // รอ confirm payment
            'payment_confirmed',    // payment ได้รับการยืนยัน
            'payment_rejected',     // payment ถูกปฏิเสธ
            'bill_generated',       // บิลใหม่ออกแล้ว
            'bill_due_reminder',    // แจ้งเตือนครบกำหนด
            'bill_overdue',         // เกินกำหนดชำระ
            'partial_payment'       // แจ้งชำระบางส่วน
        ],
        required: true
    },
    recipient: {
        userId: {
            type: mongoose.Schema.ObjectId,
            required: true
        },
        tenantId: {
            type: mongoose.Schema.ObjectId,
            // required: true
        },
        userType: {
            type: String,
            enum: ['User', 'Owner', 'Admin'],
            required: true
        }
    },
    relatedData: {
        bill: mongoose.Schema.ObjectId,
        billId: String,
        paymentId: mongoose.Schema.ObjectId,
        apartmentId: mongoose.Schema.ObjectId,
        amount: Number
    },
    message: {
        title: String,
        body: String,
        actionUrl: String
    },
    channels: [{
        type: String,
        enum: ['inapp', 'email', 'sms', 'line'],
        status: {
            type: String,
            enum: ['pending', 'sent', 'delivered', 'failed'],
            default: 'pending'
        },
        sentAt: Date,
        deliveredAt: Date
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isDisplay: {
        type: Boolean,
        default: true
    },
    readAt: Date
}, {
    timestamps: true
});

const NotificationModel = model('Notification', NotificationSchema);
export default NotificationModel;


// ========== NOTIFICATION SERVICE ==========
export class NotificationService {

    // เมื่อมี payment รอ confirm
    static async billingWaiting(bill) {

        const thaiMonths = [
            '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];


        const monthName = thaiMonths[bill.billingPeriod.month] || `เดือนที่ ${bill.billingPeriod.month}`;

        await this.create({
            type: 'bill_generated',
            recipient: {
                userId: bill.tenant.accountId,
                tenantId: bill.tenant._id,
                userType: 'User'
            },
            relatedData: {
                bill: bill._id,
                billId: bill.billId,
                apartmentId: bill.apartment._id,
                amount: bill.totalAmount
            },
            message: {
                title: 'แจ้งเตือนการชำระ',
                body: `คุณได้รับบิลค่าเช่าเดือน ${monthName}/${bill.billingPeriod.year} จำนวนเงิน ${bill.totalAmount.toLocaleString()} บาท`,
                actionUrl: `/member/listbills/bills/${bill.billId}`
            },
            channels: ['inapp'],
            priority: 'high'
        });
    }

    static async paymentWaiting(payment, check) {

        // const thaiMonths = [
        //     '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        //     'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        // ];


        // const monthName = thaiMonths[bill.billingPeriod.month] || `เดือนที่ ${bill.billingPeriod.month}`;


        await this.create({
            type: 'payment_waiting',
            recipient: {
                userId: check[0].apartmentInfo.owner,
                tenantId: payment.tenant,
                userType: 'Owner'
            },
            relatedData: {
                paymentId: payment._id,
                billId: payment.bill,
                apartmentId: payment.apartment,
                amount: payment.amount
            },
            message: {
                title: 'มีการชำระเงินรอการยืนยัน',
                body: `คุณ ${check[0].tenant.firstName} ห้อง ${check[0].tenant.roomInfo.roomNumber} ${payment.description} `,
                actionUrl: `/apartment/payment/${payment.paymentId}`
            },
            channels: ['inapp'],
            priority: 'high'
        });
    }

    // เมื่อ admin confirm payment
    static async paymentConfirmed(payment, paymentAmount) {
        console.log('payment paymentConfirmed', payment)

        const thaiMonths = [
            '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];

        if (payment.paymentStatus === "completed") {

            const monthName = thaiMonths[payment?.updatedBill?.billingPeriod?.month]

            await this.create({
                type: 'payment_confirmed',
                recipient: {
                    userId: payment.updatedPayment.tenant.accountId,
                    userType: 'User'
                },
                relatedData: {
                    bill: payment.updatedBill._id,
                    billId: payment.updatedBill.billId,
                    paymentId: payment.updatedPayment._id,
                    amount: paymentAmount
                },
                message: {
                    title: 'ยืนยันการชำระเงิน',
                    body: `ค่าเช่าเดือน ${monthName}/${payment.updatedBill.billingPeriod.year} ได้รับการยืนยันแล้ว`,
                    actionUrl: `/member/listbills/bills/${payment.updatedBill.billId}`
                },
                channels: ['inapp', 'email'],
                priority: 'medium'
            });
        } else if (payment.paymentStatus === "outstanding") {
            await this.create({
                type: 'payment_outstanding',
                recipient: {
                    userId: payment.billResult.tenant.accountId,
                    userType: 'User'
                },
                relatedData: {
                    bill: payment.billResult._id,
                    billId: payment.billResult.billId,
                    amount: paymentAmount
                },
                message: {
                    title: 'ยืนยันการชำระเงินบางส่วน',
                    body: `การชำระเงิน ${paymentAmount} บาท ได้รับการยืนยันแล้ว`,
                    actionUrl: `/member/listbills/bills/${payment.billResult.billId}`
                },
                channels: ['inapp', 'email'],
                priority: 'medium'
            });
        }

    }
    static async paymentRejected(payment, description) {

        await this.create({
            type: 'payment_rejected',
            recipient: {
                userId: payment.updatedPayment.tenant.accountId,
                userType: 'User'
            },
            relatedData: {
                bill: payment.updatedBill._id,
                billId: payment.updatedBill.billId,
                amount: 0
            },
            message: {
                title: 'การชำระเงินไม่สำเร็จ',
                body: `การชำระเงินถูกปฏิเสธ ${description} กรุณาชำระเงินใหม่`,
                actionUrl: `/member/listbills/bills/${payment.updatedBill.billId}`
            },
            channels: ['inapp', 'email'],
            priority: 'medium'
        });

    }

    // Auto reminder บิลครบกำหนด
    static async billDueReminder(bill) {
        const daysUntilDue = Math.ceil((bill.dueDate - new Date()) / (1000 * 60 * 60 * 24));

        await this.create({
            type: 'bill_due_reminder',
            recipient: {
                userId: bill.tenant,
                userType: 'tenant'
            },
            relatedData: {
                billId: bill._id,
                apartmentId: bill.apartment,
                amount: bill.remainingAmount
            },
            message: {
                title: `⏰ บิลครบกำหนดในอีก ${daysUntilDue} วัน`,
                body: `บิล ${bill.billNumber} จำนวน ${bill.remainingAmount.toLocaleString()} บาท`,
                actionUrl: `/bills/${bill._id}`
            },
            channels: ['inapp', 'sms'],
            priority: daysUntilDue <= 3 ? 'high' : 'medium'
        });
    }

    // สำหรับ partial payment
    static async partialPaymentNotification(bill, payment) {
        await this.create({
            type: 'partial_payment',
            recipient: {
                userId: bill.tenant,
                userType: 'tenant'
            },
            relatedData: {
                billId: bill._id,
                paymentId: payment._id,
                amount: bill.remainingAmount
            },
            message: {
                title: '💸 ชำระบางส่วนแล้ว',
                body: `ชำระแล้ว ${payment.amount.toLocaleString()} บาท คงเหลือ ${bill.remainingAmount.toLocaleString()} บาท`,
                actionUrl: `/bills/${bill._id}`
            },
            channels: ['inapp'],
            priority: 'medium'
        });
    }

    // Core create method
    // static async create(notificationData) {
    //     const notification = new NotificationModel(notificationData);
    //     await notification.save();

    //     // ส่งผ่าน channels ต่างๆ
    //     for (const channel of notificationData.channels) {
    //         await this.sendViaChannel(notification, channel);
    //     }

    //     return notification;
    // }
    static async create(notificationData) {

        const notification = new NotificationModel(notificationData);


        await notification.save();

        //✅ ส่งผ่าน WebSocket (Realtime)


        // ✅ ส่งผ่านช่องทางอื่น เช่น LINE, EMAIL ฯลฯ
        for (const channel of notificationData.channels) {
            await this.sendViaChannel(notification, channel);
        }

        return notification;
    }


    // ส่งผ่าน channel ต่างๆ
    static async sendViaChannel(notification, channelType) {
        try {
            switch (channelType) {
                case 'inapp':
                    await this.sendInApp(notification);
                    break;
                case 'email':
                    await this.sendEmail(notification);
                    break;
                case 'sms':
                    await this.sendSMS(notification);
                    break;
                case 'line':
                    await this.sendLine(notification);
                    break;
            }
        } catch (error) {
            console.error(`Failed to send ${channelType} notification:`, error);
        }
    }

    static async sendInApp(notification) {

        const io = getIo();

        if (io && notification.recipient?.userId) {

            io.to(notification.recipient.userId.toString()).emit('notifications', {
                id: notification._id,
                message: notification.message,
                type: notification.type,
                createdAt: notification.createdAt,
            });
        }


    }

    static async sendLine(notification) {
        // LINE Notify API
        const lineToken = await this.getLineToken(notification.recipient.userId);
        if (lineToken) {
            // ส่งผ่าน LINE Notify API
        }
    }
}

// // ========== CRON JOBS ==========
// const cron = require('node-cron');

// // ทุกวันเวลา 09:00 - เช็คบิลที่จะครบกำหนด
// cron.schedule('0 9 * * *', async () => {
//     const threeDaysFromNow = new Date();
//     threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

//     const upcomingBills = await Bill.find({
//         status: { $in: ['pending', 'partial'] },
//         dueDate: { $lte: threeDaysFromNow },
//         'notificationSent.dueReminder': { $ne: true }
//     });

//     for (const bill of upcomingBills) {
//         await NotificationService.billDueReminder(bill);
//         // Mark as notified
//         await Bill.findByIdAndUpdate(bill._id, {
//             $set: { 'notificationSent.dueReminder': true }
//         });
//     }
// });

// // ทุกวันเวลา 18:00 - เช็คบิลที่เกินกำหนด
// cron.schedule('0 18 * * *', async () => {
//     const today = new Date();

//     const overdueBills = await Bill.find({
//         status: { $in: ['pending', 'partial'] },
//         dueDate: { $lt: today }
//     });

//     for (const bill of overdueBills) {
//         await Bill.findByIdAndUpdate(bill._id, {
//             status: 'overdue'
//         });

//         await NotificationService.create({
//             type: 'bill_overdue',
//             recipient: {
//                 userId: bill.tenant,
//                 userType: 'tenant'
//             },
//             relatedData: {
//                 billId: bill._id,
//                 amount: bill.remainingAmount
//             },
//             message: {
//                 title: '🚨 บิลเกินกำหนดชำระ',
//                 body: `บิล ${bill.billNumber} เกินกำหนด ${Math.ceil((today - bill.dueDate) / (1000 * 60 * 60 * 24))} วัน`,
//                 actionUrl: `/bills/${bill._id}`
//             },
//             channels: ['inapp', 'sms'],
//             priority: 'urgent'
//         });
//     }
// });

