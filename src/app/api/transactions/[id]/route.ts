import { NextRequest, NextResponse } from 'next/server';
import { deleteTransaction, updateTransaction } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTransaction(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    
    // Convert date string back to Date object if present
    if (updates.date) {
      updates.date = new Date(updates.date);
    }
    
    await updateTransaction(params.id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}