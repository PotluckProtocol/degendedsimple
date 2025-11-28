/**
 * Telegram Bot Service
 * Sends notifications about market events to Telegram
 */

import TelegramBot from 'node-telegram-bot-api';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // Optional: set default chat ID

let bot: TelegramBot | null = null;

/**
 * Initialize the Telegram bot
 */
export function initTelegramBot(chatId?: string): TelegramBot {
  if (bot) {
    return bot;
  }

  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
  
  // Set default chat ID if provided
  if (chatId) {
    process.env.TELEGRAM_CHAT_ID = chatId;
  }

  return bot;
}

/**
 * Get the bot instance
 */
export function getTelegramBot(): TelegramBot | null {
  if (!bot) {
    bot = initTelegramBot();
  }
  return bot;
}

/**
 * Send a message to Telegram
 */
export async function sendTelegramMessage(
  message: string,
  chatId?: string
): Promise<boolean> {
  try {
    const botInstance = getTelegramBot();
    if (!botInstance) {
      console.error('Telegram bot not initialized');
      return false;
    }

    const targetChatId = chatId || TELEGRAM_CHAT_ID;
    if (!targetChatId) {
      console.error('No Telegram chat ID provided');
      return false;
    }

    await botInstance.sendMessage(targetChatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    });

    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

/**
 * Format market creation notification
 */
export function formatMarketCreatedMessage(
  marketId: number,
  question: string,
  optionA: string,
  optionB: string,
  endTime: Date,
  marketUrl?: string
): string {
  const endDate = endTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `🎲 <b>New Market Created!</b>\n\n`;
  message += `📊 <b>Market #${marketId}</b>\n\n`;
  message += `❓ <b>Question:</b> ${escapeHtml(question)}\n\n`;
  message += `✅ <b>Option A:</b> ${escapeHtml(optionA)}\n`;
  message += `❌ <b>Option B:</b> ${escapeHtml(optionB)}\n\n`;
  message += `⏰ <b>Ends:</b> ${endDate}\n`;

  if (marketUrl) {
    message += `\n🔗 <a href="${marketUrl}">View Market →</a>`;
  }

  return message;
}

/**
 * Format market resolution notification
 */
export function formatMarketResolvedMessage(
  marketId: number,
  question: string,
  outcome: number,
  optionA: string,
  optionB: string,
  totalOptionAShares: bigint,
  totalOptionBShares: bigint,
  marketUrl?: string
): string {
  const formatUSDC = (amount: bigint) => {
    return (Number(amount) / 1e6).toFixed(2);
  };

  const totalYes = formatUSDC(totalOptionAShares);
  const totalNo = formatUSDC(totalOptionBShares);
  const totalPool = Number(totalOptionAShares) + Number(totalOptionBShares);
  const totalPoolFormatted = (totalPool / 1e6).toFixed(2);

  let message = `🏁 <b>Market Resolved!</b>\n\n`;
  message += `📊 <b>Market #{marketId}</b>\n\n`;
  message += `❓ <b>Question:</b> ${escapeHtml(question)}\n\n`;

  if (outcome === 1) {
    message += `✅ <b>Winner: ${escapeHtml(optionA)}</b>\n\n`;
  } else if (outcome === 2) {
    message += `✅ <b>Winner: ${escapeHtml(optionB)}</b>\n\n`;
  } else if (outcome === 3) {
    message += `🔄 <b>Refunded</b>\n\n`;
  }

  message += `📈 <b>Betting Results:</b>\n`;
  message += `   ✅ Yes: $${totalYes}\n`;
  message += `   ❌ No: $${totalNo}\n`;
  message += `   💰 Total Pool: $${totalPoolFormatted}\n`;

  if (marketUrl) {
    message += `\n🔗 <a href="${marketUrl}">View Market →</a>`;
  }

  return message;
}

/**
 * Escape HTML for Telegram
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

