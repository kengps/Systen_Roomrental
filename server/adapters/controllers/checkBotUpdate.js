const { default: mongoose } = require("mongoose")
const botModel = require("../../frameworks/database/mongoDB/models/botModel")
const SocialAccounModel = require("../../frameworks/database/mongoDB/models/socailAccountModel")
const Tenant = require("../../frameworks/database/mongoDB/models/tenant")
const { apartmentData } = require("../repositories/apartment")
const { findOwner } = require("../repositories/register")
const { saveTelegramUpdates, updateIsUpdate, saveTelegramLog } = require("../repositories/telegramUpdate")
const TelegramUpdateModel = require("../../frameworks/database/mongoDB/models/telegramUpdateModel")
const telegramController = require("./telegramController")


const checkBotUpdate = async (c) => {
    try {
        const { accountId, apartmantId } = await c.req.json()


        // Validate ObjectId format
        if (!apartmantId || typeof apartmantId !== 'string' || apartmantId.length !== 24) {
            return c.json({
                error: 'Invalid apartmantId format',
                status: 400

            }, 400)
        }

        // Check if apartmantId is a valid hex string
        if (!/^[0-9a-fA-F]{24}$/.test(apartmantId)) {
            return c.json({
                error: 'Invalid ObjectId format - must be 24 hex characters',
                status: 400
            }, 400)
        }

        const result = await botModel.findOne({ apartmantId: apartmantId })

        if (!result || result.length === 0) {
            return c.json({ error: 'Bot not found for this apartment' }, 404)
        }

        const telegramResponse = await telegramController.getUpdates(result)

        // Extract the result array from Telegram API response
        const data = telegramResponse.result || []

        // Save updates to database (only new ones)
        const saveResult = await saveTelegramUpdates(data, apartmantId)

        return c.json({
            message: 'check bot update successfully',
            telegramData: data,
            saveResult: saveResult
        })
    } catch (error) {
        console.error('checkBotUpdate error:', error)
        return c.json({ error: error.message }, 500)
    }
}

const addSocialAccount = async (c) => {
    try {
        const data = await c.req.json()
        const fsignature = data.message.text

        const dataTenant = await Tenant.findOne({ signature: fsignature })

        if (!dataTenant) {
            return c.json({ error: 'Tenant not found' }, 404)
        }
        const dataSocial = await SocialAccounModel.findOne({ tenantId: dataTenant._id, socialName: data.social.toLowerCase() })

        if (!dataSocial) {
            const newSocial = new SocialAccounModel({
                tenantId: dataTenant._id,
                socialName: data.social.toLowerCase(),
                socialId: data.message.from.id,
                socialUsername: data.message.from.username,
                socialDisplayName: data.message.from.first_name
            })
            await newSocial.save()
        }

        await updateIsUpdate(data.update_id)

        return c.json({ message: 'add social account successfully', data: dataTenant })
    } catch (error) {
        console.error('addSocialAccount error:', error)
        return c.json({ error: error.message }, 500)
    }
}
const addSocialAccountToTenant = async (updates, social = 'telegram') => {
    try {

        // ตรวจสอบว่า updates เป็น array
        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return {
                success: false,
                message: 'Updates array is required',
                results: [],
                errors: []
            }
        }

        // ตรวจสอบว่า social name มีค่า
        if (!social) {
            return {
                success: false,
                message: 'Social name is required',
                results: [],
                errors: []
            }
        }

        const socialName = social.toLowerCase()
        const results = []
        const errors = []

        // วน loop ผ่านแต่ละ update
        for (const update of updates) {
            try {
                // ข้าม updates ที่ไม่มี text หรือ text เป็น 'No text'
                if (!update.text || update.text === 'No text' || update.text.trim() === '') {
                    errors.push({
                        update_id: update.update_id,
                        reason: 'No valid text found',
                        text: update.text
                    })
                    continue
                }

                const signature = update.text.trim()

                // ค้นหา Tenant จาก signature
                const dataTenant = await Tenant.findOne({ signature })

                if (!dataTenant) {
                    errors.push({
                        update_id: update.update_id,
                        text: signature,
                        reason: 'Tenant not found with matching signature'
                    })
                    continue
                }

                // ดึงข้อมูล update จาก database เพื่อเอา from information
                const telegramUpdate = await TelegramUpdateModel.findOne({ update_id: update.update_id })

                if (!telegramUpdate || !telegramUpdate.message || !telegramUpdate.message.from) {
                    errors.push({
                        update_id: update.update_id,
                        text: signature,
                        reason: 'Update data not found or missing from information'
                    })
                    continue
                }

                const fromInfo = telegramUpdate.message.from
                const socialId = String(fromInfo.id || '')

                if (!socialId) {
                    errors.push({
                        update_id: update.update_id,
                        text: signature,
                        reason: 'Social ID (from.id) is missing'
                    })
                    continue
                }

                // ตรวจสอบว่ามี SocialAccount อยู่แล้วหรือไม่
                const existingSocial = await SocialAccounModel.findOne({
                    tenantId: dataTenant._id,
                    socialName: socialName
                })

                if (!existingSocial) {
                    // สร้าง SocialAccount ใหม่
                    const newSocial = new SocialAccounModel({
                        tenantId: dataTenant._id,
                        socialName: socialName,
                        socialId: socialId,
                        socialUsername: fromInfo.username || null,
                        socialDisplayName: fromInfo.first_name || null
                    })
                    await newSocial.save()

                    results.push({
                        update_id: update.update_id,
                        text: signature,
                        tenant: {
                            _id: dataTenant._id,
                            firstName: dataTenant.firstName,
                            lastName: dataTenant.lastName,
                            fullName: `${dataTenant.firstName} ${dataTenant.lastName}`
                        },
                        socialAccount: {
                            _id: newSocial._id,
                            socialName: newSocial.socialName,
                            socialId: newSocial.socialId,
                            socialUsername: newSocial.socialUsername
                        },
                        action: 'created'
                    })
                } else {
                    // อัปเดต SocialAccount ที่มีอยู่แล้ว (ถ้าต้องการ)
                    existingSocial.socialId = socialId
                    if (fromInfo.username) existingSocial.socialUsername = fromInfo.username
                    if (fromInfo.first_name) existingSocial.socialDisplayName = fromInfo.first_name
                    await existingSocial.save()

                    results.push({
                        update_id: update.update_id,
                        text: signature,
                        tenant: {
                            _id: dataTenant._id,
                            firstName: dataTenant.firstName,
                            lastName: dataTenant.lastName,
                            fullName: `${dataTenant.firstName} ${dataTenant.lastName}`
                        },
                        socialAccount: {
                            _id: existingSocial._id,
                            socialName: existingSocial.socialName,
                            socialId: existingSocial.socialId,
                            socialUsername: existingSocial.socialUsername
                        },
                        action: 'updated'
                    })
                }

                // อัปเดต isUpdate flag
                await updateIsUpdate(update.update_id)

            } catch (error) {
                console.error(`Error processing update ${update.update_id}:`, error.message)
                errors.push({
                    update_id: update.update_id,
                    text: update.text,
                    reason: `Error: ${error.message}`
                })
            }
        }

        return {
            success: true,
            message: 'Processed updates successfully',
            total: updates.length,
            successCount: results.length,
            failedCount: errors.length,
            results,
            errors
        }

    } catch (error) {
        console.error('addSocialAccountToTenant error:', error)
        return {
            success: false,
            message: error.message,
            results: [],
            errors: []
        }
    }
}


const sendMessage = async (c) => {
    try {
        const data = await c.req.json()
        const { apartmentId, tenantId, social } = data
        
        // Validate required fields
        if (!apartmentId) {
            return c.json({ error: 'apartmantId is required' }, 400)
        }
        
        console.log(`⩇⩇:⩇⩇🚨 ~ tenantId :`, tenantId);

        if (!tenantId) {
            return c.json({ error: 'tenantId is required' }, 400)
        }
        
        if (!social) {
            return c.json({ error: 'social is required' }, 400)
        }
        
        //ต้องมี apartmantId เพื่อเอา botId
        // และเอา TenantId เพื่อเอา socialId
        const result = await botModel.findOne({ apartmantId: apartmentId })
        
        if (!result) {
            return c.json({ error: 'Bot not found for this apartment' }, 404)
        }

        const dataSocial = await SocialAccounModel.findOne({ 
            tenantId: new mongoose.Types.ObjectId(tenantId), 
            socialName: social.toLowerCase() 
        })
        
        if (!dataSocial) {
            return c.json({ error: 'Social account not found for this tenant' }, 404)
        }

        const sendMessageResult = await telegramController.sendMessage(result, dataSocial, data)
       ;


        await saveTelegramLog(sendMessageResult, result, dataSocial)


        return c.json({ message: 'send message successfully' ,sendMessageResult})
    } catch (error) {
        console.error('sendMessage error:', error)
        return c.json({ error: error.message }, 500)
    }
}


module.exports = {
    checkBotUpdate,
    addSocialAccount,
    sendMessage,
    addSocialAccountToTenant
}