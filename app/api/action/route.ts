import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

async function updateDatabase(actionAddress: string, targetAddress: string): Promise<void> {
  // Connection details for Vercel Postgres
  const client = new Pool({
    connectionString: process.env.DATABASE_URL, // Ensure this environment variable is set with your database URL
    ssl: {
      rejectUnauthorized: false,
    },
  });

  console.log('Client created');

  try {
    // Connect to the database
    await client.connect();

    console.log('Client connected');

    // Begin a transaction
    await client.query('BEGIN');

    console.log('Query finished');

    // Check if the actionAddress and targetAddress exist
    const res = await client.query(
      `SELECT count FROM actions WHERE action_address = $1 AND target_address = $2`,
      [actionAddress, targetAddress],
    );

    if (res.rows.length > 0) {
      console.log('Exists');
      // If exists, increment the count
      await client.query(
        `UPDATE actions SET count = count + 1 WHERE action_address = $1 AND target_address = $2`,
        [actionAddress, targetAddress],
      );
    } else {
      console.log('No exist');
      // If not, insert a new record
      await client.query(
        `INSERT INTO actions (action_address, target_address, count) VALUES ($1, $2, 1)`,
        [actionAddress, targetAddress],
      );
    }

    // Commit the transaction
    await client.query('COMMIT');

    console.log('Database updated successfully.');
  } catch (err) {
    console.error('Error updating the database:', err);
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
  } finally {
    console.log('Closing the connection');
    // Close the database connection
    await client.end();

    console.log('Closed!');
    return;
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: 'NEYNAR_ONCHAIN_KIT',
    castReactionContext: true,
    followContext: true,
  });

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  console.log('Ready to update database');
  await updateDatabase('test2', 'test');
  console.log('Finished updateDatabase');
  return NextResponse.json({ message: 'Updated DB' }, { status: 200 });
}

export async function GET(req: NextRequest): Promise<Response> {
  console.log('GET');
  return NextResponse.json({ message: 'TODO' }, { status: 200 });
}

export const dynamic = 'force-dynamic';
