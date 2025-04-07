import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get messages for a specific room
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Get messages for the room, ordered by timestamp
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { timestamp: 'asc' },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Save a new message
export async function POST(req: NextRequest) {
  try {
    const { roomId, sender, content, type = 'text' } = await req.json();

    if (!roomId || !sender || !content) {
      return NextResponse.json(
        { success: false, error: 'Room ID, sender, and content are required' },
        { status: 400 }
      );
    }

    // Create a new message
    const message = await prisma.message.create({
      data: {
        roomId,
        sender,
        content,
        type,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    );
  }
}