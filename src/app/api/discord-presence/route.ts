import { NextResponse } from 'next/server';
import { getDiscordPresenceState, updateDiscordPresence } from '@/lib/discordPresence';

export async function GET() {
  try {
    const state = await getDiscordPresenceState();
    return NextResponse.json({
      status: state.status,
      activity: state.activity,
      listening: state.listening,
      updatedAt: state.updatedAt,
    });
  } catch (error) {
    console.error('Discord presence GET error:', error);
    return NextResponse.json({ error: 'Unable to retrieve Discord presence' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const active = Boolean(body.active);
    const listening = Boolean(body.listening);

    const state = await updateDiscordPresence({ active, listening });
    return NextResponse.json({
      status: state.status,
      activity: state.activity,
      listening: state.listening,
      updatedAt: state.updatedAt,
    });
  } catch (error) {
    console.error('Discord presence POST error:', error);
    return NextResponse.json({ error: 'Unable to update Discord presence' }, { status: 500 });
  }
}
