#!/bin/bash

# Telegram Bot Service Startup Script
echo "🤖 Starting Telegram Bot Service..."

# Check if BOT_TOKEN is set
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ Error: TELEGRAM_BOT_TOKEN environment variable is not set"
    echo "Please set your Telegram bot token:"
    echo "export TELEGRAM_BOT_TOKEN='your_bot_token_here'"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --package-lock-only
fi

# Start the bot
echo "🚀 Starting Telegram bot polling..."
node telegramBot.js
