import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  const { isValid } = await getFrameMessage(body, {
    neynarApiKey: process.env.NEYNAR_KEY,
  });

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  return NextResponse.json(
    { type: 'frame', frameurl: `${NEXT_PUBLIC_URL}/frames/peck` },
    { status: 200 },
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
