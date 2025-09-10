import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyBalance, setMonthlyBalance, updateMonthlyBalance } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { month: string } }
) {
  try {
    const balance = await getMonthlyBalance(params.month);
    return NextResponse.json(balance);
  } catch (error: any) {
    console.error('Error fetching monthly balance:', error);
    
    let message = 'Failed to fetch monthly balance';
    let statusCode = 500;
    
    if (error.code === '28P01') {
      message = 'Database authentication failed. Please check your database credentials.';
      statusCode = 503;
    } else if (error.code === '3D000') {
      message = 'Database not found. Please create the TrackBudgetDb database.';
      statusCode = 503;
    } else if (error.code === 'ECONNREFUSED') {
      message = 'Cannot connect to PostgreSQL. Please ensure PostgreSQL is running.';
      statusCode = 503;
    }
    
    return NextResponse.json(
      { error: message, code: error.code },
      { status: statusCode }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { month: string } }
) {
  try {
    const balance = await request.json();
    await setMonthlyBalance(params.month, balance);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting monthly balance:', error);
    return NextResponse.json(
      { error: 'Failed to set monthly balance' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { month: string } }
) {
  try {
    const updates = await request.json();
    await updateMonthlyBalance(params.month, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating monthly balance:', error);
    return NextResponse.json(
      { error: 'Failed to update monthly balance' },
      { status: 500 }
    );
  }
}