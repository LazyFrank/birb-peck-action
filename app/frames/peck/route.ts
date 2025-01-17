import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { LAZYFRANK_URL } from '../../config';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // const body: FrameRequest = await req.json();
  // const { isValid } = await getFrameMessage(body, {
  //   neynarApiKey: process.env.NEYNAR_KEY,
  // });

  // if (!isValid) {
  //   return new NextResponse('Message not valid', { status: 500 });
  // }

  //   const text = message.input || '';
  //   let state = {
  //     page: 0,
  //   };
  //   try {
  //     state = JSON.parse(decodeURIComponent(message.state?.serialized));
  //   } catch (e) {
  //     console.error(e);
  //   }

  //   /**
  //    * Use this code to redirect to a different page
  //    */
  //   if (message?.button === 3) {
  //     return NextResponse.redirect(
  //       'https://www.google.com/search?q=cute+dog+pictures&tbm=isch&source=lnms',
  //       { status: 302 },
  //     );
  //   }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          action: 'post',
          label: 'Lazy Birbs Peck',
          target: `${LAZYFRANK_URL}/api/peck`,
        },
      ],
      image: {
        src: `${LAZYFRANK_URL}/peck.gif`,
        aspectRatio: '1:1',
      },
      postUrl: `${LAZYFRANK_URL}/api/peck`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export async function GET(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
