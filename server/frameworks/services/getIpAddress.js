const { getConnInfo } = require('@hono/node-server/conninfo')
exports.GetIpAddress = async (req) => {
    //  const ip = req.connection.remoteAddress
    console.log(`⩇⩇:⩇⩇🚨 ~ eq.socket :`, await req);

    const ip = req.socket.remoteAddress

    const ipv2 = ip.split(':')
    const ipOk = ipv2[ipv2.length - 1]
    return ipOk
}

exports.getClientIP = (c) => {
    // ลำดับความสำคัญในการหา IP
    const forwarded = c.req.header('x-forwarded-for')
    const realIp = c.req.header('x-real-ip')
    const cfConnectingIp = c.req.header('cf-connecting-ip')
    const xClientIp = c.req.header('x-client-ip')

    const forwardedIp = forwarded?.split(',')[0]?.trim()

    // ถ้าเป็น development ให้ใช้ localhost
    const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

    const ip = forwardedIp ||
        realIp ||
        cfConnectingIp ||
        xClientIp ||
        c.env?.incoming?.socket?.remoteAddress ||
        (isDevelopment ? '127.0.0.1' : 'unknown')

    console.log(`Client IP: ${ip} (${isDevelopment ? 'dev' : 'prod'})`);
    return ip;
}