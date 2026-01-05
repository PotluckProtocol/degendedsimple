/**
 * Telegram Bot Service (JavaScript version for Node.js scripts)
 */

const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let bot = null;

function initTelegramBot(chatId, enablePolling = false) {
  if (bot && !enablePolling) {
    return bot;
  }

  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
  }

  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: enablePolling });
  
  if (chatId) {
    process.env.TELEGRAM_CHAT_ID = chatId;
  }

  return bot;
}

function getTelegramBot() {
  if (!bot) {
    bot = initTelegramBot();
  }
  return bot;
}

async function sendTelegramMessage(message, chatId) {
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

function formatMarketCreatedMessage(marketId, question, optionA, optionB, endTime, marketUrl) {
  const endDate = endTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/New_York'
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

function formatMarketResolvedMessage(
  marketId,
  question,
  outcome,
  optionA,
  optionB,
  totalOptionAShares,
  totalOptionBShares,
  marketUrl
) {
  const formatUSDC = (amount) => {
    return (Number(amount) / 1e6).toFixed(2);
  };

  const totalYes = formatUSDC(totalOptionAShares);
  const totalNo = formatUSDC(totalOptionBShares);
  const totalPool = Number(totalOptionAShares) + Number(totalOptionBShares);
  const totalPoolFormatted = (totalPool / 1e6).toFixed(2);

  let message = `🏁 <b>Market Resolved!</b>\n\n`;
  message += `📊 <b>Market #${marketId}</b>\n\n`;
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

function formatOpenMarketsMessage(markets, siteUrl) {
  if (markets.length === 0) {
    return '📊 <b>No Open Markets</b>\n\nThere are currently no active markets.';
  }

  let message = `📊 <b>Open Markets (${markets.length})</b>\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  for (const market of markets) {
    const endDate = market.endTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York'
    });

    const yesAmount = (Number(market.totalOptionAShares) / 1e6).toFixed(2);
    const noAmount = (Number(market.totalOptionBShares) / 1e6).toFixed(2);
    const totalPool = (Number(market.totalOptionAShares) + Number(market.totalOptionBShares)) / 1e6;
    const totalPoolFormatted = totalPool.toFixed(2);

    message += `🎲 <b>Market #${market.marketId}</b>\n`;
    message += `❓ ${escapeHtml(market.question)}\n\n`;
    message += `✅ ${escapeHtml(market.optionA)}: $${yesAmount}\n`;
    message += `❌ ${escapeHtml(market.optionB)}: $${noAmount}\n`;
    message += `💰 Pool: $${totalPoolFormatted}\n`;
    message += `⏰ Ends: ${endDate}\n`;
    
    if (siteUrl) {
      message += `🔗 <a href="${siteUrl}/?market=${market.marketId}">View →</a>\n`;
    }
    
    message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  }

  return message;
}

function formatLatestResolvedMessage(market, siteUrl) {
  if (!market) {
    return '📊 <b>No Resolved Markets</b>\n\nThere are currently no resolved markets.';
  }

  const formatUSDC = (amount) => {
    return (Number(amount) / 1e6).toFixed(2);
  };

  const totalYes = formatUSDC(market.totalOptionAShares);
  const totalNo = formatUSDC(market.totalOptionBShares);
  const totalPool = Number(market.totalOptionAShares) + Number(market.totalOptionBShares);
  const totalPoolFormatted = (totalPool / 1e6).toFixed(2);

  let message = `🏁 <b>Latest Resolved Market</b>\n\n`;
  message += `📊 <b>Market #${market.marketId}</b>\n\n`;
  message += `❓ <b>Question:</b> ${escapeHtml(market.question)}\n\n`;

  if (market.outcome === 1) {
    message += `✅ <b>Winner: ${escapeHtml(market.optionA)}</b>\n\n`;
  } else if (market.outcome === 2) {
    message += `✅ <b>Winner: ${escapeHtml(market.optionB)}</b>\n\n`;
  } else if (market.outcome === 3) {
    message += `🔄 <b>Refunded</b>\n\n`;
  }

  message += `📈 <b>Betting Results:</b>\n`;
  message += `   ✅ Yes: $${totalYes}\n`;
  message += `   ❌ No: $${totalNo}\n`;
  message += `   💰 Total Pool: $${totalPoolFormatted}\n`;

  if (siteUrl) {
    // If siteUrl already contains ?market=, it's a full URL, use it and add tab parameter
    // Otherwise, construct the full URL from the base URL
    const url = siteUrl.includes('?market=') 
      ? (siteUrl.includes('&tab=') ? siteUrl : `${siteUrl}&tab=resolved`)
      : `${siteUrl}/?market=${market.marketId}&tab=resolved`;
    message += `\n🔗 <a href="${url}">View Market →</a>`;
  }

  return message;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  initTelegramBot,
  getTelegramBot,
  sendTelegramMessage,
  formatMarketCreatedMessage,
  formatMarketResolvedMessage,
  formatOpenMarketsMessage,
  formatLatestResolvedMessage,
};

