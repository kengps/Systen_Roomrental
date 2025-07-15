const tokenModel = require("../../../frameworks/database/mongoDB/models/tokenModel");



exports.findeToken = async (token) => {

    // ตรวจสอบว่ามี Token ที่ยังไม่หมดอายุอยู่หรือไม่
    const existingToken = await tokenModel.findOne({
        token
    });

    return existingToken
}
exports.createTokenLogin = async (userId, token, expiresAt) => {

    const tokenData = new tokenModel({
        userId,
        token,
        expiresAt,
        accountId: userId,
    });
    // await this.redisService.del('token:alltoken');
    await tokenData.save();
    return tokenData;
}
exports.getExistingToken = async (userId) => {

    // ตรวจสอบว่ามี Token ที่ยังไม่หมดอายุอยู่หรือไม่
    const existingToken = await tokenModel.findOne({
        userId,
        expiresAt: { $gt: new Date() }, // Token ที่ยังไม่หมดอายุ
    });

    return existingToken
}
exports.deleteTokenLogin = async (tokenId) => {
    return await tokenModel.findByIdAndDelete({ _id: tokenId })

}