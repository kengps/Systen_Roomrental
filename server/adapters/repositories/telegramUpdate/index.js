const botModel = require('../../../frameworks/database/mongoDB/models/botModel')
const telegramLogModel = require('../../../frameworks/database/mongoDB/models/telegramLogModel')
const TelegramUpdateModel = require('../../../frameworks/database/mongoDB/models/telegramUpdateModel')
const Tenant = require('../../../frameworks/database/mongoDB/models/tenant')


/**
 * Save Telegram updates to database
 * Only saves new updates that don't already exist
 * @param {Array} updates - Array of Telegram updates
 * @param {String} apartmentId - Apartment ID
 * @returns {Object} - Result with saved and skipped counts
 */
exports.saveTelegramUpdates = async (updates, apartmentId) => {
    try {
        let session = await TelegramUpdateModel.startSession()
        session.startTransaction()
        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return {
                success: false,
                message: 'No updates to save',
                saved: 0,
                skipped: 0
            }
        }

        const savedUpdates = []
        const skippedUpdates = []

        for (const update of updates) {
            try {
                // Check if update already exists
                const existingUpdate = await TelegramUpdateModel.findOne({
                    update_id: update.update_id
                })

                if (existingUpdate) {
                    skippedUpdates.push({
                        update_id: update.update_id,
                        reason: 'Already exists'
                    })
                    continue
                }

                // Create new update document
                const updateData = {
                    ...update,
                    apartmentId: apartmentId
                }

                const newUpdate = new TelegramUpdateModel(updateData)
                const savedUpdate = await newUpdate.save()

                // Prepare saved update info based on update type
                let savedUpdateInfo = {
                    update_id: savedUpdate.update_id,
                    type: 'unknown'
                }

                // Handle message updates
                if (savedUpdate.message) {
                    savedUpdateInfo.type = 'message'
                    savedUpdateInfo.message_id = savedUpdate.message.message_id
                    savedUpdateInfo.from = savedUpdate.message.from?.username || savedUpdate.message.from?.first_name
                    savedUpdateInfo.text = savedUpdate.message.text || 'No text'
                    savedUpdateInfo.chat_id = savedUpdate.message.chat?.id
                    savedUpdateInfo.chat_type = savedUpdate.message.chat?.type
                }
                // Handle my_chat_member updates
                else if (savedUpdate.my_chat_member) {
                    savedUpdateInfo.type = 'my_chat_member'
                    savedUpdateInfo.from = savedUpdate.my_chat_member.from?.username || savedUpdate.my_chat_member.from?.first_name
                    savedUpdateInfo.chat_id = savedUpdate.my_chat_member.chat?.id
                    savedUpdateInfo.chat_title = savedUpdate.my_chat_member.chat?.title
                    savedUpdateInfo.chat_type = savedUpdate.my_chat_member.chat?.type
                    savedUpdateInfo.old_status = savedUpdate.my_chat_member.old_chat_member?.status
                    savedUpdateInfo.new_status = savedUpdate.my_chat_member.new_chat_member?.status
                    savedUpdateInfo.bot_user = savedUpdate.my_chat_member.new_chat_member?.user?.username || savedUpdate.my_chat_member.new_chat_member?.user?.first_name
                    savedUpdateInfo.text = `Bot status changed: ${savedUpdateInfo.old_status} → ${savedUpdateInfo.new_status}`
                }
                // Handle callback_query updates
                else if (savedUpdate.callback_query) {
                    savedUpdateInfo.type = 'callback_query'
                    savedUpdateInfo.from = savedUpdate.callback_query.from?.username || savedUpdate.callback_query.from?.first_name
                    savedUpdateInfo.data = savedUpdate.callback_query.data
                    savedUpdateInfo.text = `Callback: ${savedUpdate.callback_query.data || 'No data'}`
                }
                // Handle edited_message updates
                else if (savedUpdate.edited_message) {
                    savedUpdateInfo.type = 'edited_message'
                    savedUpdateInfo.message_id = savedUpdate.edited_message.message_id
                    savedUpdateInfo.from = savedUpdate.edited_message.from?.username || savedUpdate.edited_message.from?.first_name
                    savedUpdateInfo.text = savedUpdate.edited_message.text || 'No text'
                }
                // Handle channel_post updates
                else if (savedUpdate.channel_post) {
                    savedUpdateInfo.type = 'channel_post'
                    savedUpdateInfo.message_id = savedUpdate.channel_post.message_id
                    savedUpdateInfo.chat_title = savedUpdate.channel_post.chat?.title
                    savedUpdateInfo.text = savedUpdate.channel_post.text || 'No text'
                }

                savedUpdates.push(savedUpdateInfo)

            } catch (error) {
                console.error(`Error saving update ${update.update_id}:`, error.message)
                skippedUpdates.push({
                    update_id: update.update_id,
                    reason: `Error: ${error.message}`
                })
            }
        }

        await session.commitTransaction()
        session.endSession()
        return {
            success: true,
            message: `Processed ${updates.length} updates`,
            saved: savedUpdates.length,
            skipped: skippedUpdates.length,
            savedUpdates,
            skippedUpdates
        }

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.error('Error in saveTelegramUpdates:', error)
        return {
            success: false,
            message: error.message,
            saved: 0,
            skipped: 0
        }
    }
}

/**
 * Get Telegram updates for an apartment
 * @param {String} apartmentId - Apartment ID
 * @param {Object} options - Query options
 * @returns {Array} - Array of updates
 */
exports.getTelegramUpdates = async (apartmentId, options = {}) => {
    try {
        const {
            limit = 50,
            skip = 0,
            processed = null,
            startDate = null,
            endDate = null
        } = options

        const query = { apartmentId }

        if (processed !== null) {
            query.processed = processed
        }

        if (startDate || endDate) {
            query.createdAt = {}
            if (startDate) query.createdAt.$gte = new Date(startDate)
            if (endDate) query.createdAt.$lte = new Date(endDate)
        }

        const updates = await TelegramUpdateModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .populate('apartmentId', 'name domain')

        return {
            success: true,
            data: updates,
            count: updates.length
        }

    } catch (error) {
        console.error('Error in getTelegramUpdates:', error)
        return {
            success: false,
            message: error.message,
            data: []
        }
    }
}

/**
 * Mark update as processed
 * @param {Number} updateId - Update ID
 * @param {Object} response - Response data
 * @returns {Object} - Result
 */
exports.markUpdateProcessed = async (updateId, response = {}) => {
    try {
        const update = await TelegramUpdateModel.findOneAndUpdate(
            { update_id: updateId },
            {
                processed: true,
                processedAt: new Date(),
                response: {
                    sent: response.sent || false,
                    sentAt: response.sent ? new Date() : null,
                    message: response.message || '',
                    error: response.error || ''
                }
            },
            { new: true }
        )

        if (!update) {
            return {
                success: false,
                message: 'Update not found'
            }
        }

        return {
            success: true,
            message: 'Update marked as processed',
            data: update
        }

    } catch (error) {
        console.error('Error in markUpdateProcessed:', error)
        return {
            success: false,
            message: error.message
        }
    }
}

/**
 * Get unprocessed updates
 * @param {String} apartmentId - Apartment ID
 * @returns {Array} - Array of unprocessed updates
 */
exports.getUnprocessedUpdates = async (apartmentId) => {
    try {
        const updates = await TelegramUpdateModel.find({
            apartmentId,
            processed: false
        }).sort({ createdAt: 1 })

        return {
            success: true,
            data: updates,
            count: updates.length
        }

    } catch (error) {
        console.error('Error in getUnprocessedUpdates:', error)
        return {
            success: false,
            message: error.message,
            data: []
        }
    }
}

/**
 * Delete old updates (older than specified days)
 * @param {Number} daysOld - Days old to delete
 * @returns {Object} - Result
 */
exports.deleteOldUpdates = async (daysOld = 30) => {
    try {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysOld)

        const result = await TelegramUpdateModel.deleteMany({
            createdAt: { $lt: cutoffDate }
        })

        return {
            success: true,
            message: `Deleted ${result.deletedCount} old updates`,
            deletedCount: result.deletedCount
        }

    } catch (error) {
        console.error('Error in deleteOldUpdates:', error)
        return {
            success: false,
            message: error.message
        }
    }
}

exports.updateIsUpdate = async (updateId) => {


    try {
        return await TelegramUpdateModel.findOneAndUpdate(
            { update_id: updateId },
            { isUpdate: true }
        )
    } catch (error) {
        console.error('Error in updateIsUpdate:', error)
        return {
            success: false,
            message: error.message
        }
    }
}


exports.saveTelegramLog = async (sendMessageResult, result, dataSocial) => {


    try {

        if (!sendMessageResult.ok) {
            await telegramLogModel.create({
                botName: sendMessageResult.result.from.username,
                socialName: dataSocial.socialName,
                socialId: dataSocial.socialId,
                messageText: sendMessageResult.result.text,
                status: "failed",
                errorMessage: data.description,
            });

            return false;
        }

        await telegramLogModel.create({
            botName: sendMessageResult.result.from.username,
            socialName: dataSocial.socialName,
            socialId: dataSocial.socialId,
            messageText: sendMessageResult.result.text,
            status: "success",

        });


        return true;
    } catch (err) {
        await telegramLogModel.create({
            botId: bot._id,
            chatId,
            messageText: text,
            status: "error",
            errorMessage: err.message,
        });
        console.error(`⚠️ Error sending message: ${err.message}`);
    }

}


exports.getUpdateBotTelegram = async (id) => {
    try {

        const bot = await botModel.findById(id)

        if (!bot) {
            return {
                success: false,
                message: 'Bot not found'
            }
        }

        if (!bot.apartmantId) {
            return {
                success: false,
                message: 'Bot apartmentId not found'
            }
        }

        let url = `https://api.telegram.org/bot${bot.token}/getUpdates`
        let response = await fetch(url)
        let data = await response.json()

        let result = {}
        // Save updates if result exists
        if (data.ok && data.result && Array.isArray(data.result)) {
            result = await exports.saveTelegramUpdates(data.result, bot.apartmantId)
        }

        return result

    } catch (error) {
        console.error('Error in getUpdateBotTelegram:', error)
        return {
            success: false,
            message: error.message
        }
    }
}

exports.updateIsUpdateIdToTenant = async (updates) => {
    try {
        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return {
                success: false,
                message: 'No updates provided',
                matched: [],
                notMatched: []
            }
        }

        const matchedResults = []
        const notMatchedUpdates = []

        // วน loop ผ่านแต่ละ update
        for (const update of updates) {
            // ข้าม updates ที่ไม่มี text หรือ text เป็น 'No text' หรือ undefined
            if (!update.text || update.text === 'No text' || update.text.trim() === '') {
                notMatchedUpdates.push({
                    update_id: update.update_id,
                    reason: 'No valid text found',
                    text: update.text
                })
                continue
            }

            try {
                // ค้นหา Tenant ที่มี signature ตรงกับ text
                const tenant = await Tenant.findOne({ signature: update.text.trim() })

                if (tenant) {
                    // พบ Tenant ที่ตรงกัน
                    matchedResults.push({
                        update_id: update.update_id,
                        text: update.text,
                        tenant: {
                            _id: tenant._id,
                            firstName: tenant.firstName,
                            lastName: tenant.lastName,
                            fullName: `${tenant.firstName} ${tenant.lastName}`,
                            phone: tenant.phone,
                            signature: tenant.signature,
                            room: tenant.room,
                            accountId: tenant.accountId
                        },
                        matched: true
                    })
                } else {
                    // ไม่พบ Tenant ที่ตรงกัน
                    notMatchedUpdates.push({
                        update_id: update.update_id,
                        text: update.text,
                        reason: 'No tenant found with matching signature',
                        matched: false
                    })
                }
            } catch (error) {
                console.error(`Error processing update ${update.update_id}:`, error.message)
                notMatchedUpdates.push({
                    update_id: update.update_id,
                    text: update.text,
                    reason: `Error: ${error.message}`,
                    matched: false
                })
            }
        }

        return {
            success: true,
            message: `Processed ${updates.length} updates`,
            total: updates.length,
            matched: matchedResults.length,
            notMatched: notMatchedUpdates.length,
            matchedResults,
            notMatchedUpdates
        }

    } catch (error) {
        console.error('Error in updateIsUpdateIdToTenant:', error)
        return {
            success: false,
            message: error.message,
            matched: [],
            notMatched: []
        }
    }
}