import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      action: 'link',
      label: 'Add Lazy Birb Peck Action',
      target:
        'https://warpcast.com/~/add-cast-action?actionType=post&name=Lazy+Birbs+Peck&icon=dot&postUrl=https%3A%2F%2Fbirb-peck-action.vercel.app%2Fapi%2Faction',
    },
  ],
  image: {
    src: `${NEXT_PUBLIC_URL}/birbs.png`,
    aspectRatio: '1:1',
  },
});

export const metadata: Metadata = {
  title: 'lazybirbs.xyz',
  description: 'Hootie Hoot',
  openGraph: {
    title: 'lazybirbs.xyz',
    description: 'Hootie Hoot',
    images: [`${NEXT_PUBLIC_URL}/birbs.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>Hootie Hoot</h1>
    </>
  );
}
