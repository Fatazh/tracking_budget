import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyBalance, setMonthlyBalance, updateMonthlyBalance } from '@/lib/database';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const MONTH_REGEX = /^\d{4}-\d{2}$/;

const validateMonthParam = (month: string): NextResponse | null => {
  if (!MONTH_REGEX.test(month)) {
    return NextResponse.json(
      { error: 'Invalid month format. Use YYYY-MM.' },
      { status: 400 }
    );
  }
  return null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { month: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const invalidMonthResponse = validateMonthParam(params.month);
    if (invalidMonthResponse) {
      return invalidMonthResponse;
    }
    const balance = await getMonthlyBalance(userId, params.month);
    return NextResponse.json(balance);
  } catch (error: any) {
    // ...existing code...
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const invalidMonthResponse = validateMonthParam(params.month);
    if (invalidMonthResponse) {
      return invalidMonthResponse;
    }
    const balance = await request.json();
    await setMonthlyBalance(userId, params.month, balance);
    return NextResponse.json({ success: true });
  } catch (error) {
    // ...existing code...
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const invalidMonthResponse = validateMonthParam(params.month);
    if (invalidMonthResponse) {
      return invalidMonthResponse;
    }
    const updates = await request.json();
    await updateMonthlyBalance(userId, params.month, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    // ...existing code...
    return NextResponse.json(
      { error: 'Failed to update monthly balance' },
      { status: 500 }
    );
  }
}
