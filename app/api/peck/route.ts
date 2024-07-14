import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
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

async function updateDatabase(
  actorFID: string,
  targetFID: string,
  targetUsername: string,
): Promise<Response> {
  const client = await pool.connect();

  console.log(`Actor FID: ${actorFID}`);
  console.log(`Target FID: ${targetFID}`);

  let shareText = `I pecked my fren @${targetUsername} to show them I care.%0A%0AJoin the pecking in /lazybirbs with our cast action linked below%0A%0A- Pecking the same person has a 10 minute cooldown%0A- There may be a leaderboard in the future with potential prizes but no promises`;
  let shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${LAZYFRANK_URL}&channelKey=lazybirbs`;

  try {
    // Begin a transaction
    await client.query('BEGIN');

    // Check if the actorFID and targetFID exist and when it was last updated
    const res = await client.query(
      `SELECT count, last_updated FROM actions WHERE actor_fid = $1 AND target_fid = $2`,
      [actorFID, targetFID],
    );

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    if (res.rows.length > 0) {
      const { count, last_updated } = res.rows[0];

      if (new Date(last_updated) < tenMinutesAgo) {
        // If exists and was updated more than 10 minutes ago, increment the count and update the timestamp
        await client.query(
          `UPDATE actions SET count = count + 1, last_updated = NOW() WHERE actor_fid = $1 AND target_fid = $2`,
          [actorFID, targetFID],
        );
        await client.query('COMMIT');
        // Successful DB Write
        return new NextResponse(
          getFrameHtmlResponse({
            buttons: [
              {
                action: 'link',
                label: 'Share Your Peck',
                target: shareUrl,
              },
            ],
            image: {
              src: `${LAZYFRANK_URL}/success.png`,
              aspectRatio: '1:1',
            },
            postUrl: `${LAZYFRANK_URL}/api/peck`,
          }),
        );
      } else {
        await client.query('ROLLBACK');
        return new NextResponse(
          getFrameHtmlResponse({
            buttons: [
              {
                action: 'post',
                label: 'Try Again',
                target: `${LAZYFRANK_URL}/api/peck`,
              },
            ],
            image: {
              src: `${LAZYFRANK_URL}/wait.png`,
              aspectRatio: '1:1',
            },
            postUrl: `${LAZYFRANK_URL}/api/peck`,
          }),
        );
      }
    } else {
      // If not, insert a new record
      await client.query(
        `INSERT INTO actions (actor_fid, target_fid, count, last_updated) VALUES ($1, $2, 1, NOW())`,
        [actorFID, targetFID],
      );
      await client.query('COMMIT');
      return new NextResponse(
        getFrameHtmlResponse({
          buttons: [
            {
              action: 'link',
              label: 'Share Your Peck',
              target: shareUrl,
            },
          ],
          image: {
            src: `${LAZYFRANK_URL}/success.png`,
            aspectRatio: '1:1',
          },
          postUrl: `${LAZYFRANK_URL}/api/peck`,
        }),
      );
    }
  } catch (err) {
    console.error('Error updating the database:', err);
    await client.query('ROLLBACK');
    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${LAZYFRANK_URL}/failed.png`,
          aspectRatio: '1:1',
        },
        postUrl: `${LAZYFRANK_URL}/api/peck`,
      }),
    );
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body: FrameRequest = await req.json();
    const { isValid, message } = await getFrameMessage(body, {
      neynarApiKey: 'NEYNAR_ONCHAIN_KIT',
      castReactionContext: true,
      followContext: true,
    });

    if (!isValid) {
      return new NextResponse('Message not valid', { status: 500 });
    }

    return updateDatabase(
      `${message.interactor.fid}`,
      `${message.raw.action.cast.author.fid}`,
      `${message.raw.action.cast.author.username}`,
    );
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
