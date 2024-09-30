
const sendResponse = (res, statusCode, message, result) => {
    return res.status(statusCode).send({ message, result })
}

const sendResponseResult = (res, statusCode, message, result) => {
    return res.status(statusCode).json({ message, result })
}

module.exports = {
    sendResponse,
    sendResponseResult
}; 