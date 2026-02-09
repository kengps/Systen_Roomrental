const { getUpdateBotTelegram, updateIsUpdateIdToTenant } = require("../repositories/telegramUpdate")
const { addSocialAccountToTenant } = require("./checkBotUpdate")
const botModel = require("../../frameworks/database/mongoDB/models/botModel")

// Sync bot updates
exports.updateBotTelegram = async (c) => {
    const { botId } = await c.req.query()

    const data = await getUpdateBotTelegram(botId)

    // Process social accounts if savedUpdates exist
    if (data && data.savedUpdates && Array.isArray(data.savedUpdates)) {
        await addSocialAccountToTenant(data.savedUpdates, 'telegram')
    }

    return c.json({ success: true, message: "update bot telegram successfully" }, 200)
}

// List bots for an apartment
exports.listBots = async (c) => {
    try {
        const { apartmentId } = await c.req.query()

        if (!apartmentId) {
            return c.json({ error: 'apartmentId is required' }, 400)
        }

        const bots = await botModel.find({ apartmantId: apartmentId }).sort({ createdAt: -1 })

        return c.json({
            success: true,
            data: { bots }
        })
    } catch (error) {
        console.error('listBots error:', error)
        return c.json({ error: error.message }, 500)
    }
}

// Create a new bot
exports.createBot = async (c) => {
    try {
        const { token, botName, apartmantId } = await c.req.json()

        if (!token || !botName || !apartmantId) {
            return c.json({ error: 'token, botName, and apartmantId are required' }, 400)
        }

        // Validate token format
        if (!/^\d+:[A-Za-z0-9_-]+$/.test(token)) {
            return c.json({ error: 'Invalid token format' }, 400)
        }

        const newBot = new botModel({
            token,
            botName,
            apartmantId
        })

        const savedBot = await newBot.save()

        return c.json({
            success: true,
            message: 'Bot created successfully',
            data: savedBot
        })
    } catch (error) {
        console.error('createBot error:', error)
        if (error.code === 11000) {
            return c.json({ error: 'Bot with this token already exists' }, 400)
        }
        return c.json({ error: error.message }, 500)
    }
}

// Update a bot
exports.updateBot = async (c) => {
    try {
        const { id } = c.req.param()
        const { token, botName, apartmantId } = await c.req.json()

        if (!id) {
            return c.json({ error: 'Bot ID is required' }, 400)
        }

        const updateData = {}
        if (token) {
            // Validate token format
            if (!/^\d+:[A-Za-z0-9_-]+$/.test(token)) {
                return c.json({ error: 'Invalid token format' }, 400)
            }
            updateData.token = token
        }
        if (botName) updateData.botName = botName
        if (apartmantId) updateData.apartmantId = apartmantId

        const updatedBot = await botModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )

        if (!updatedBot) {
            return c.json({ error: 'Bot not found' }, 404)
        }

        return c.json({
            success: true,
            message: 'Bot updated successfully',
            data: updatedBot
        })
    } catch (error) {
        console.error('updateBot error:', error)
        return c.json({ error: error.message }, 500)
    }
}

// Delete a bot
exports.deleteBot = async (c) => {
    try {
        const { id } = c.req.param()

        if (!id) {
            return c.json({ error: 'Bot ID is required' }, 400)
        }

        const deletedBot = await botModel.findByIdAndDelete(id)

        if (!deletedBot) {
            return c.json({ error: 'Bot not found' }, 404)
        }

        return c.json({
            success: true,
            message: 'Bot deleted successfully'
        })
    } catch (error) {
        console.error('deleteBot error:', error)
        return c.json({ error: error.message }, 500)
    }
}
