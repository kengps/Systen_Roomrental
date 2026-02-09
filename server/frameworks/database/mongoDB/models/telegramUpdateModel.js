const mongoose = require('mongoose')

const telegramUpdateSchema = new mongoose.Schema({
    update_id: {
        type: Number,
        required: true,
        unique: true
    },
    message: {
        message_id: {
            type: Number
        },
        from: {
            id: {
                type: Number
            },
            is_bot: {
                type: Boolean,
                default: false
            },
            first_name: String,
            last_name: String,
            username: String,
            language_code: String
        },
        chat: {
            id: {
                type: Number
            },
            first_name: String,
            last_name: String,
            username: String,
            type: {
                type: String,
                enum: ['private', 'group', 'supergroup', 'channel'],
                default: 'private'
            }
        },
        date: {
            type: Number
        },
        text: String,
        photo: [{
            file_id: String,
            file_unique_id: String,
            width: Number,
            height: Number,
            file_size: Number
        }],
        document: {
            file_id: String,
            file_unique_id: String,
            file_name: String,
            mime_type: String,
            file_size: Number
        },
        sticker: {
            file_id: String,
            file_unique_id: String,
            type: String,
            width: Number,
            height: Number,
            is_animated: Boolean,
            is_video: Boolean,
            emoji: String,
            set_name: String
        },
        voice: {
            file_id: String,
            file_unique_id: String,
            duration: Number,
            mime_type: String,
            file_size: Number
        },
        video: {
            file_id: String,
            file_unique_id: String,
            width: Number,
            height: Number,
            duration: Number,
            mime_type: String,
            file_size: Number,
            thumb: {
                file_id: String,
                file_unique_id: String,
                width: Number,
                height: Number,
                file_size: Number
            }
        },
        audio: {
            file_id: String,
            file_unique_id: String,
            duration: Number,
            performer: String,
            title: String,
            mime_type: String,
            file_size: Number
        },
        location: {
            longitude: Number,
            latitude: Number
        },
        contact: {
            phone_number: String,
            first_name: String,
            last_name: String,
            user_id: Number
        }
    },
    edited_message: {
        message_id: Number,
        from: {
            id: Number,
            is_bot: Boolean,
            first_name: String,
            last_name: String,
            username: String,
            language_code: String
        },
        chat: {
            id: Number,
            first_name: String,
            last_name: String,
            username: String,
            type: String
        },
        date: Number,
        edit_date: Number,
        text: String
    },
    channel_post: {
        message_id: Number,
        sender_chat: {
            id: Number,
            title: String,
            username: String,
            type: String
        },
        chat: {
            id: Number,
            title: String,
            username: String,
            type: String
        },
        date: Number,
        text: String
    },
    edited_channel_post: {
        message_id: Number,
        sender_chat: {
            id: Number,
            title: String,
            username: String,
            type: String
        },
        chat: {
            id: Number,
            title: String,
            username: String,
            type: String
        },
        date: Number,
        edit_date: Number,
        text: String
    },
    callback_query: {
        id: String,
        from: {
            id: Number,
            is_bot: Boolean,
            first_name: String,
            last_name: String,
            username: String,
            language_code: String
        },
        message: {
            message_id: Number,
            from: {
                id: Number,
                is_bot: Boolean,
                first_name: String,
                last_name: String,
                username: String,
                language_code: String
            },
            chat: {
                id: Number,
                first_name: String,
                last_name: String,
                username: String,
                type: String
            },
            date: Number,
            text: String
        },
        data: String,
        game_short_name: String
    },
    my_chat_member: {
        chat: {
            id: {
                type: Number
            },
            title: String,
            type: {
                type: String,
                enum: ['private', 'group', 'supergroup', 'channel'],
                default: 'private'
            },
            username: String,
            first_name: String,
            last_name: String,
            all_members_are_administrators: Boolean,
            accepted_gift_types: {
                unlimited_gifts: Boolean,
                limited_gifts: Boolean,
                unique_gifts: Boolean,
                premium_subscription: Boolean
            }
        },
        from: {
            id: {
                type: Number
            },
            is_bot: {
                type: Boolean,
                default: false
            },
            first_name: String,
            last_name: String,
            username: String,
            language_code: String
        },
        date: {
            type: Number
        },
        old_chat_member: {
            user: {
                id: Number,
                is_bot: Boolean,
                first_name: String,
                last_name: String,
                username: String
            },
            status: {
                type: String,
                enum: ['creator', 'administrator', 'member', 'restricted', 'left', 'kicked']
            }
        },
        new_chat_member: {
            user: {
                id: Number,
                is_bot: Boolean,
                first_name: String,
                last_name: String,
                username: String
            },
            status: {
                type: String,
                enum: ['creator', 'administrator', 'member', 'restricted', 'left', 'kicked']
            }
        }
    },
    // Reference to apartment
    apartmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: true
    },
    // Processing status
    processed: {
        type: Boolean,
        default: false
    },
    processedAt: {
        type: Date
    },
    // Response data
    response: {
        sent: Boolean,
        sentAt: Date,
        message: String,
        error: String
    },
    isUpdate: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// Indexes for better performance
telegramUpdateSchema.index({ update_id: 1 })
telegramUpdateSchema.index({ apartmentId: 1 })
telegramUpdateSchema.index({ 'message.from.id': 1 })
telegramUpdateSchema.index({ 'message.chat.id': 1 })
telegramUpdateSchema.index({ processed: 1 })
telegramUpdateSchema.index({ createdAt: -1 })

module.exports = mongoose.model('TelegramUpdate', telegramUpdateSchema)
