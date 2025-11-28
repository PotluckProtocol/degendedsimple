/**
 * Telegram Webhook Handler
 * Receives market events and sends Telegram notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  sendTelegramMessage, 
  formatMarketCreatedMessage, 
  formatMarketResolvedMessage 
} from '@/lib/telegram-bot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://degended.bet';
    const marketUrl = `${baseUrl}/?market=${data.marketId || ''}`;

    switch (event) {
      case 'market_created':
        const createdMessage = formatMarketCreatedMessage(
          data.marketId,
          data.question,
          data.optionA,
          data.optionB,
          new Date(data.endTime * 1000),
          marketUrl
        );
        await sendTelegramMessage(createdMessage);
        break;

      case 'market_resolved':
        const resolvedMessage = formatMarketResolvedMessage(
          data.marketId,
          data.question,
          data.outcome,
          data.optionA,
          data.optionB,
          BigInt(data.totalOptionAShares),
          BigInt(data.totalOptionBShares),
          marketUrl
        );
        await sendTelegramMessage(resolvedMessage);
        break;

      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

