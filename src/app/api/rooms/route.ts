import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all available rooms
export async function GET(req: NextRequest) {
  try {
    // Get all unique roomIds from messages
    const messages = await prisma.message.findMany({
      select: {
        roomId: true,
      },
      distinct: ['roomId'],
    });

    // Extract room IDs
    const rooms = messages.map(message => message.roomId);

    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

// Create a new room
export async function POST(req: NextRequest) {
  try {
    const { roomId } = await req.json();
    
    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      );
    }
    
    // Create a placeholder message to ensure the room exists in the database
    // This is needed because rooms are currently only tracked via messages
    await prisma.message.create({
      data: {
        roomId,
        sender: 'System',
        content: 'Room created',
      },
    });
    
    return NextResponse.json({ success: true, roomId });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    );
  }
}