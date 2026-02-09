const uploadService = require("../../frameworks/services/uploadService")



exports.UploadFiles = async (file) => {


    return await uploadService.uploadFile(file)

}
exports.DeleteFiles = async (key) => {


    return await uploadService.deleteFile(key)

}