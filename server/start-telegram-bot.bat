@echo off
REM Telegram Bot Service Startup Script for Windows

echo 🤖 Starting Telegram Bot Service...

REM Check if BOT_TOKEN is set
if "%TELEGRAM_BOT_TOKEN%"=="" (
    echo ❌ Error: TELEGRAM_BOT_TOKEN environment variable is not set
    echo Please set your Telegram bot token:
    echo set TELEGRAM_BOT_TOKEN=your_bot_token_here
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install --package-lock-only
)

REM Start the bot
echo 🚀 Starting Telegram bot polling...
node telegramBot.js

pause