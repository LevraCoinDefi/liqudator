import TelegramBot from 'node-telegram-bot-api';
import dotenv from "dotenv";

dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID ?? '';

if (!token || !chatId) {
  console.error('Telegram token or chat ID not provided');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: false });

export async function sendMessage(message: string): Promise<void> {
  try {
    await bot.sendMessage(chatId, message);
    console.log(`Telegram message sent: ${message}`);
  } catch (error: unknown) {
    console.error(`Failed to send Telegram message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
