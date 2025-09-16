import { NextRequest, NextResponse } from 'next/server';
import { addTransaction, getTransactions } from '@/lib/database';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || undefined;
    const userId = Number(session.user.id);
    const transactions = await getTransactions(userId, month);
    return NextResponse.json(transactions);
  } catch (error: any) {
    // ...existing code...
    let message = 'Failed to fetch transactions';
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const transaction = await request.json();
    if (
      typeof transaction.amount !== 'number' ||
      !transaction.category ||
      !transaction.description ||
      !transaction.type ||
      !transaction.date
    ) {
      return NextResponse.json(
        { error: 'Invalid transaction payload' },
        { status: 400 }
      );
    }
    transaction.date = new Date(transaction.date);
    const userId = session.user.id;
    const id = await addTransaction(transaction, Number(userId));
    return NextResponse.json({ id }, { status: 201 });
  } catch (error: any) {
    // ...existing code...
    let message = 'Failed to add transaction';
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
