import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { LAZYFRANK_URL } from '../../config';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { type: 'frame', frameurl: `${LAZYFRANK_URL}/frames/peck` },
    { status: 200 },
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
