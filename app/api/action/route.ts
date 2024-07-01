import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';

async function updateJsonFile(actionAddress: string, targetAddress: string): Promise<void> {
  // Read the JSON file
  const filePath = 'peck.json';

  try {
    const data = await fs.readFile(filePath, 'utf8');

    // Parse the JSON data
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      return;
    }

    // Update the JSON data
    jsonData[actionAddress] = jsonData[actionAddress] || {};
    jsonData[actionAddress][targetAddress] = (jsonData[actionAddress][targetAddress] || 0) + 1;

    // Write the updated JSON back to the file
    try {
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
      console.log('File updated successfully.');
    } catch (writeErr) {
      console.error('Error writing the file:', writeErr);
    }
  } catch (err) {
    console.error('Error reading the file:', err);
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

  await updateJsonFile('test2', 'test');

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
