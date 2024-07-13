import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { LAZYFRANK_URL } from '../../config';
import { Pool } from 'pg';

// Initialize the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this environment variable is set with your database URL
  ssl: {
    rejectUnauthorized: false,
  },
});

interface UpdateResults {
  updated: boolean;
  reason: string;
}

async function updateDatabase(
  actionAddress: string,
  targetAddress: string,
): Promise<UpdateResults> {
  const client = await pool.connect();

  try {
    // Begin a transaction
    await client.query('BEGIN');

    // Check if the actionAddress and targetAddress exist and when it was last updated
    const res = await client.query(
      `SELECT count, last_updated FROM actions WHERE action_address = $1 AND target_address = $2`,
      [actionAddress, targetAddress],
    );

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    if (res.rows.length > 0) {
      const { count, last_updated } = res.rows[0];

      if (new Date(last_updated) < tenMinutesAgo) {
        // If exists and was updated more than 10 minutes ago, increment the count and update the timestamp
        await client.query(
          `UPDATE actions SET count = count + 1, last_updated = NOW() WHERE action_address = $1 AND target_address = $2`,
          [actionAddress, targetAddress],
        );
        await client.query('COMMIT');
        return { updated: true, reason: 'Count incremented and timestamp updated.' };
      } else {
        await client.query('ROLLBACK');
        return {
          updated: false,
          reason: 'Update skipped as it was updated within the last 10 minutes.',
        };
      }
    } else {
      // If not, insert a new record
      await client.query(
        `INSERT INTO actions (action_address, target_address, count, last_updated) VALUES ($1, $2, 1, NOW())`,
        [actionAddress, targetAddress],
      );
      await client.query('COMMIT');
      return { updated: true, reason: 'New record inserted.' };
    }
  } catch (err) {
    console.error('Error updating the database:', err);
    await client.query('ROLLBACK');
    return { updated: false, reason: `Error updating the database: ${err}` };
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    console.log('Request:');
    console.log(req);
    const body: FrameRequest = await req.json();
    console.log('Body:');
    console.log(body);
    const { isValid, message } = await getFrameMessage(body, {
      neynarApiKey: 'NEYNAR_ONCHAIN_KIT',
      castReactionContext: true,
      followContext: true,
    });

    if (!isValid) {
      return new NextResponse('Message not valid', { status: 500 });
    }

    console.log('Message:');
    console.log(message);

    console.log('Ready to update database');
    await updateDatabase('Doodoo', 'Test123');
    console.log('Finished updateDatabase');
    return NextResponse.json({ message: 'Updated DB' }, { status: 200 });
  } catch (error) {
    console.error('Error processing POST request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// GET Request Logic
export async function GET(req: NextRequest): Promise<Response> {
  console.log('GET');

  return NextResponse.json(
    {
      name: 'LazyBirb Peck',
      icon: 'dot',
      description: 'Peck a fren',
      aboutUrl: `${LAZYFRANK_URL}`,
      action: {
        type: 'post',
        postUrl: `${LAZYFRANK_URL}/frames/peck`,
      },
    },
    { status: 200 },
  );
}

export const dynamic = 'force-dynamic';
