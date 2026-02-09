const LogActionss = require("../database/mongoDB/models/zzzzzz_log_zzzzz");



class LogActions {
    static async submitLogActons(data) {   // ✅ ใช้ static
        const { ipAddress, action, actor, details } = data;

        const result = new LogActionss({
            ipAddress,
            action,
            actor,
            details,
        });

        await result.save();
    }
}

module.exports = { LogActions };
