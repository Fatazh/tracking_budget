import { NextRequest, NextResponse } from 'next/server';
import { addTransaction, getTransactions } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || undefined;
    
    const transactions = await getTransactions(month);
    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    
    // Provide specific error messages
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
    const transaction = await request.json();
    
    // Convert date string back to Date object
    transaction.date = new Date(transaction.date);
    
    const id = await addTransaction(transaction);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding transaction:', error);
    
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