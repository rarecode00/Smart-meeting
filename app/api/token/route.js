import { StreamClient } from '@stream-io/node-sdk';
import { NextResponse } from 'next/server';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET;
const validity = 24 * 60 * 60; // 24 hours in seconds

if (!apiKey || !apiSecret) {
    throw new Error("STREAM API key and secret must be set in environment variables");
}

const serverClient = new StreamClient(apiKey, apiSecret);

export async function POST(req) {
    const { userId } = await req.json();

    if (!userId) {
        return NextResponse.json(
            { error: 'userId is required' },
            { status: 400 }
        );
    }

    const token = serverClient.generateUserToken({ user_id: userId, validity_in_seconds: validity });

    return NextResponse.json({ token, apiKey });
}