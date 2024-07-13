import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import type { Metadata } from 'next';
import { LAZYFRANK_URL } from './config';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      action: 'link',
      label: 'Add LazyBirb Peck Action',
      target:
        'https://warpcast.com/~/add-cast-action?actionType=post&name=Lazy+Birbs+Peck&icon=dot&postUrl=https%3A%2F%2Fbirb-peck-action.vercel.app%2Factions%2Fpeck',
    },
  ],
  image: {
    src: `${LAZYFRANK_URL}/birbs.png`,
    aspectRatio: '1:1',
  },
});

export const metadata: Metadata = {
  title: 'birb-peck-action.vercel.app',
  description: 'Hootie Hoot',
  openGraph: {
    title: 'birb-peck-action.vercel.app',
    description: 'Hootie Hoot',
    images: [`${LAZYFRANK_URL}/birbs.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <div>
        <a href="https://warpcast.com/~/add-cast-action?actionType=post&name=Lazy+Birbs+Peck&icon=dot&postUrl=https%3A%2F%2Fwarpcast.lazyfrank.xyz%2Factions%2Fpeck">
          Click here to install the Lazy Birb Peck action on Warpcast.
        </a>
      </div>
    </>
  );
}
