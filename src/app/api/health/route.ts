import { NextResponse } from 'next/server';
import { getDbClient } from '@/lib/postgres';

export async function GET() {
  try {
    // Test database connection
    const client = await getDbClient();
    
    try {
      // Simple query to test connection
      await client.query('SELECT 1');
      client.release();
      
      return NextResponse.json({ 
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      client.release();
      throw error;
    }
  } catch (error: any) {
    console.error('Database health check failed:', error);
    
    // Provide specific error messages based on error code
    let message = 'Database connection failed';
    let suggestion = '';
    
    if (error.code === '28P01') {
      message = 'Authentication failed';
      suggestion = 'Check database credentials (username/password)';
    } else if (error.code === '3D000') {
      message = 'Database does not exist';
      suggestion = 'Create the TrackBudgetDb database';
    } else if (error.code === 'ECONNREFUSED') {
      message = 'PostgreSQL server is not running';
      suggestion = 'Start PostgreSQL service';
    } else if (error.code === 'ENOTFOUND') {
      message = 'PostgreSQL server not found';
      suggestion = 'Check database host configuration';
    }
    
    return NextResponse.json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: message,
      suggestion,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}