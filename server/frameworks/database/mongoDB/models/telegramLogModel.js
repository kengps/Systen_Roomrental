const mongoose = require("mongoose");

const telegramLogSchema = new mongoose.Schema(
    {
        botName: {
            type: String,
            required: true,
        },

        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant", // ถ้ามีระบบเช่า
        },
        socialName: {
            type: String, // user id ใน Telegram
            required: true,
        },
        socialId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["sent", "error", "success", "failed"],
            default: "",
        },
        errorMessage: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

telegramLogSchema.index({ botId: 1, chatId: 1, createdAt: -1 });
module.exports = mongoose.model("zzzz_TelegramLog_zzzz", telegramLogSchema);
