const { LogActions } = require("../../../frameworks/services/logActions");
const { handleRequestError } = require("../../../frameworks/webserver/utils/HOCHandelRequest");



exports.SubmitLogs = async (data) => {

    try {
        return await LogActions.submitLogActons(data)

    } catch (error) {
        throw error
    }

}