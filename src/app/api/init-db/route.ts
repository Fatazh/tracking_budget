import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/postgres';

export async function POST() {
  try {
    await initializeDatabase();
    return NextResponse.json({ message: 'Database initialized successfully' }, { status: 200 });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' }, 
      { status: 500 }
    );
  }
}