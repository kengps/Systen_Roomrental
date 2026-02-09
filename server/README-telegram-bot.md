# Telegram Bot Service

Telegram bot polling service ที่รันแยกจากแอปหลัก

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install node-fetch
```

2. ตั้งค่า environment variable:
```bash
# Linux/Mac
export TELEGRAM_BOT_TOKEN="your_bot_token_here"

# Windows
set TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## การรัน

### วิธีที่ 1: ใช้ script
```bash
# Linux/Mac
chmod +x start-telegram-bot.sh
./start-telegram-bot.sh

# Windows
start-telegram-bot.bat
```

### วิธีที่ 2: รันโดยตรง
```bash
node telegramBot.js
```

### วิธีที่ 3: ใช้ nodemon (สำหรับ development)
```bash
npm install -g nodemon
nodemon telegramBot.js
```

## การใช้งาน

1. สร้าง Telegram Bot ผ่าน @BotFather
2. เอา token ที่ได้มาใส่ใน environment variable
3. รัน service
4. ส่งข้อความหา bot ใน Telegram

## Features

- ✅ Long polling (30 วินาที timeout)
- ✅ Auto-reconnect เมื่อเกิด error
- ✅ Error handling
- ✅ Logging ข้อความที่ได้รับ
- ✅ Auto-reply ข้อความ

## การปรับแต่ง

แก้ไขฟังก์ชัน `handleUpdate()` ใน `telegramBot.js` เพื่อเพิ่ม logic การตอบกลับที่ซับซ้อนขึ้น