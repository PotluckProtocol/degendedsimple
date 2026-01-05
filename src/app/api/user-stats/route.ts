import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    const userAddress = address.toLowerCase();

    // Fetch all events for this user from the database
    const result = await query(
      'SELECT market_id, event_type, amount, is_option_a, tx_hash, block_number FROM market_events WHERE user_address = $1 ORDER BY block_number DESC',
      [userAddress]
    );

    // Group events by market for easier frontend processing
    const eventsByMarket: Record<number, any[]> = {};
    result.rows.forEach((row: any) => {
      const mId = row.market_id;
      if (!eventsByMarket[mId]) {
        eventsByMarket[mId] = [];
      }
      eventsByMarket[mId].push({
        type: row.event_type,
        amount: row.amount,
        isOptionA: row.is_option_a,
        txHash: row.tx_hash,
        blockNumber: row.block_number
      });
    });

    return NextResponse.json({
      success: true,
      data: eventsByMarket,
      count: result.rowCount
    });
  } catch (error: any) {
    console.error('API User Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats from database' }, { status: 500 });
  }
}

