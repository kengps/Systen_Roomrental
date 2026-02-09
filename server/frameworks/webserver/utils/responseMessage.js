
const sendResponse = (res, statusCode, message, result) => {
    return res.status(statusCode).send({ ststus: statusCode, message, result })
}

const sendResponseResult = (res, statusCode, message, result) => {
    return res.status(statusCode).json({ ststus: statusCode, message, result })
}


const sendResponseHono = (c, statusCode, message, result, total) => {
    return c.json({ status: statusCode, message, result, total }, statusCode)
}
const sendResponseHonos = (c, statusCode, message, result, total) => {
    return c.json({ status: statusCode, message, result, total }, statusCode)
}


function sendError(word = "เกิดข้อผิดพลาด", keyError = "") {
    let message = word; // default: ใช้ข้อความเดิมถ้าไม่เข้าเงื่อนไข

    if (word.includes("ไม่พบ")) {
        message = `${keyError} not found`;
        const error = new Error(message);
        error.status = 404;
        error.type = "NOT_FOUND";
        throw error;
    } else if (word.includes("ซ้ำ")) {
        message = `${keyError} already exists (duplicate data)`;
        const error = new Error(message);
        error.status = 409;
        error.type = "DUPLICATE";
        throw error;
    } else if (word.includes("ไม่มีสิทธิ์")) {
        message = `Unauthorized access to ${keyError}`;
        const error = new Error(message);
        error.status = 403;
        error.type = "UNAUTHORIZED";
        throw error;
    } else if (word.includes("คำนวณ")) {
        message = `${keyError} is incorrect`;
        const error = new Error(message);
        error.status = 403;
        error.type = "UNAUTHORIZED";
        throw error;
    }
    else if (word.includes("ไม่ถูกต้อง")) {
        message = `${keyError} is invalid`;
        const error = new Error(message);
        error.status = 422;
        error.type = "VALIDATION";
        throw error;
    }
    else if (word.includes("หมดอายุ")) {
        message = `${keyError}`
        const error = new Error(message);
        error.status = 1003;
        error.type = "EXPIRE";
        throw error;
    } else {
        message = "General error occurred";
        const error = new Error(message);
        error.status = 500;
        error.type = "GENERAL";
        throw error;
    }
}



module.exports = {
    sendResponse,
    sendResponseResult,
    sendResponseHono,
    sendError
}; 