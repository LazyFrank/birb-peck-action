import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

async function updateDatabase(actionAddress: string, targetAddress: string): Promise<void> {
  // Connection details for Vercel Postgres
  const client = new Client({
    connectionString: process.env.DATABASE_URL, // Ensure this environment variable is set with your database URL
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Connect to the database
    await client.connect();

    // Begin a transaction
    await client.query('BEGIN');

    // Check if the actionAddress and targetAddress exist
    const res = await client.query(
      `SELECT count FROM actions WHERE action_address = $1 AND target_address = $2`,
      [actionAddress, targetAddress],
    );

    if (res.rows.length > 0) {
      // If exists, increment the count
      await client.query(
        `UPDATE actions SET count = count + 1 WHERE action_address = $1 AND target_address = $2`,
        [actionAddress, targetAddress],
      );
    } else {
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
    // Close the database connection
    await client.end();
  }
}

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // TODO
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: 'NEYNAR_ONCHAIN_KIT',
    castReactionContext: true,
    followContext: true,
  });

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  await updateDatabase('test2', 'test');

  return NextResponse.json({ message: 'Hello from the frame route' }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<Response> {
  console.log('POST');
  return getResponse(req);
}

export async function GET(req: NextRequest): Promise<Response> {
  console.log('GET');
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
