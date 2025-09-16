import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/postgres';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const client = await getDbClient();
  try {
    const result = await client.query(
      `SELECT id, name, type, icon
       FROM categories
       WHERE user_id = $1
       ORDER BY type, name`,
      [userId]
    );
    const categories = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type as 'income' | 'expense',
      icon: row.icon,
    }));
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const client = await getDbClient();
  try {
    const { name, type, icon } = await request.json();
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    const id = slug || `category-${Date.now()}`;
    const result = await client.query(
      `INSERT INTO categories (id, name, type, icon, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, type, icon`,
      [id, name, type, icon || 'fas fa-question-circle', userId]
    );
    const newCategory = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      type: result.rows[0].type as 'income' | 'expense',
      icon: result.rows[0].icon,
    };
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}