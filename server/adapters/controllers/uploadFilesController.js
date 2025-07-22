const uploadService = require("../../frameworks/services/uploadService")



exports.UploadFiles = async (file) => {
console.log(`⩇⩇:⩇⩇🚨 ~ exports.UploadFiles= ~ file :`, file);


    return await uploadService.uploadFile(file)

}