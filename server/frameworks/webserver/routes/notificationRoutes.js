const { Hono } = require("hono");
const { markAsRead, markAllAsRead } = require("../../../adapters/controllers/notificationController");
const { auth } = require("../middleware/auth");
const { getNotifications } = require("../../../adapters/controllers/slipuploadController");
const { updateBotTelegram } = require("../../../adapters/controllers/botTelegramController");
const { getTelegramUpdates } = require("../../../adapters/repositories/telegramUpdate");





const appNotifications = new Hono()

appNotifications.get('/notifications', auth, getNotifications);


appNotifications.patch('/notifications/:id/read', markAsRead)

appNotifications.patch('/notifications/mark-all-read', auth, markAllAsRead)

appNotifications.get('/update-bot-telegram', updateBotTelegram)

// Get Telegram Updates
appNotifications.get('/telegram-updates', async (c) => {
    try {
        const { apartmentId, processed, startDate, endDate, limit, skip } = c.req.query();
        
        if (!apartmentId) {
            return c.json({ error: 'apartmentId is required' }, 400);
        }

        const options = {
            processed: processed === 'true' ? true : processed === 'false' ? false : null,
            startDate: startDate || null,
            endDate: endDate || null,
            limit: limit ? parseInt(limit) : 50,
            skip: skip ? parseInt(skip) : 0
        };

        const result = await getTelegramUpdates(apartmentId, options);
        return c.json(result);
    } catch (error) {
        console.error('Error in telegram-updates route:', error);
        return c.json({ error: error.message }, 500);
    }
});




module.exports = appNotifications