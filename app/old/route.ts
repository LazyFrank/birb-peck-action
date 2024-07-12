import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../config';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  console.log(body);
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: process.env.NEYNAR_KEY,
  });
  console.log(message);

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  // if interactor has not liked the post we will not show the animal
  if (!message?.liked) {
    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${NEXT_PUBLIC_URL}/birbs.png`,
          aspectRatio: '1:1',
        },
        buttons: [
          {
            label: 'Like the post to see your spirit animal',
          },
        ],
        postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
      }),
    );
  }

  const shareText = `My spirit animal caught me so offguard! What's yours? Thanks @LazyFrank`;
  const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${NEXT_PUBLIC_URL}`;

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          action: 'link',
          label: 'Share',
          target: shareUrl,
        },
      ],
      image: {
        src: `${NEXT_PUBLIC_URL}/birbs.png`,
        aspectRatio: '1:1',
      },
      postUrl: `${NEXT_PUBLIC_URL}/api/peck`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return new NextResponse(
    { type: 'frame', frameurl: 'https://birb-peck-action.vercel.app/api/action' },
    { status: 500 },
  );
}

export const dynamic = 'force-dynamic';
