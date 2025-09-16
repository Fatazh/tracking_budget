import { NextRequest, NextResponse } from 'next/server';
import { deleteTransaction, updateTransaction } from '@/lib/database';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteTransaction(params.id, Number(session.user.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    if (error instanceof Error && error.message === 'Transaction not found') {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const updates = await request.json();
    
    // Convert date string back to Date object if present
    if (updates.date) {
      updates.date = new Date(updates.date);
    }
    
    await updateTransaction(params.id, Number(session.user.id), updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating transaction:', error);
    if (error instanceof Error && error.message === 'Transaction not found') {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
