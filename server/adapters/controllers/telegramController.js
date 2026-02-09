
const thaiMonthMap = {
    1: "มกราคม",
    2: "กุมภาพันธ์",
    3: "มีนาคม",
    4: "เมษายน",
    5: "พฤษภาคม",
    6: "มิถุนายน",
    7: "กรกฎาคม",
    8: "สิงหาคม",
    9: "กันยายน",
    10: "ตุลาคม",
    11: "พฤศจิกายน",
    12: "ธันวาคม",
};
class TelegramController {
    constructor() {

    }


    async getUpdates(token) {

        try {
            const data = await fetch(`https://api.telegram.org/bot${token.token}/getUpdates`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const result = await data.json()

            return result
        } catch (error) {
            console.error('getUpdates error:', error)
            return c.json({ error: error.message }, 500)
        }
    }

    async sendMessage(result, social, data) {

        // Validate data
        if (!data) {
            throw new Error('Data is required')
        }

        if (!data.billingPeriod) {
            throw new Error('billingPeriod is required')
        }

        let month = thaiMonthMap[data.billingPeriod.month]

        let year = data.billingPeriod.year

        // Format number with comma separator
        const formatNumber = (num) => {
            if (!num && num !== 0) return '0'
            return Number(num).toLocaleString('th-TH')
        }



        let text = ''

        if (data.paymentStatus === 'completed') {
            text = `✅ <b>ยืนยันการชำระเงิน</b>
            🏠 <b>ห้อง:</b> ${data.tenantInfo.roomNumber}
            👤 <b>ชื่อผู้รับบิล:</b> ${data?.tenantInfo?.name}
            💰 <b>จำนวนเงิน:</b> ${formatNumber(data?.paidAmount)} บาท
            📅 <b>ประจำเดือน:</b> ${month} ${year}`
        } else {
            text = `❌ <b>ยกเลิกการชำระเงิน</b>
👤 <b>ชื่อผู้รับบิล:</b> ${data.tenantInfo.firstName} ${data.tenantInfo.lastName}
🏠 <b>ห้อง:</b> ${data.tenantInfo.roomNumber}`
        }

        let rs = []
        // const url = `https://api.telegram.org/bot${token.token}/sendMessage`
        try {

            if (social.socialName === 'telegram') {

                let payLoad = {
                    "chat_id": social.socialId,
                    "text": text,
                    "parse_mode": "HTML",
                    " disable_web_page_preview": true
                }

                const url = `https://api.telegram.org/bot${result.token}/sendMessage`
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payLoad)
                })
                const responseData = await response.json()

                rs.push(responseData)

            }



            return rs[0]
        } catch (error) {

            return {
                success: false,
                message: error.message
            }
        }
    }

}


module.exports = new TelegramController()