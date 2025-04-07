import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { networkInterfaces } from 'os';

// Helper function to extract IP address and network ID
function getIpAddress(req: NextRequest): { ipAddress: string; networkId: string } {
  // Get the client's IP address
  // First try to get it from the request headers
  const forwarded = req.headers.get('x-forwarded-for');
  let ipAddress = forwarded ? forwarded.split(',')[0] : '';
  
  // If we couldn't get a valid IP from headers, use the server's network interface
  if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === 'localhost') {
    // Get the server's local IP address
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (loopback) addresses
        if (net.family === 'IPv4' && !net.internal) {
          ipAddress = net.address;
          break;
        }
      }
      if (ipAddress) break;
    }
    
    // If we still don't have an IP, use a fallback
    if (!ipAddress) ipAddress = '127.0.0.1';
  }
  
  // Extract network ID (first three octets of IP address)
  const networkId = ipAddress.split('.').slice(0, 3).join('.');
  
  return { ipAddress, networkId };
}

// Create or update a user based on IP address
export async function POST(req: NextRequest) {
  try {
    const { nickname, customRoomId } = await req.json();
    const { ipAddress, networkId } = getIpAddress(req);
    
    // Create or update user
    const user = await prisma.user.upsert({
      where: { ipAddress },
      update: { nickname },
      create: { ipAddress, nickname },
    });

    // Use custom room ID if provided, otherwise use network ID
    const roomId = customRoomId ? customRoomId : `room-${networkId}`;

    return NextResponse.json({ 
      success: true, 
      user, 
      ipAddress,
      networkId,
      roomId
    });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process user' },
      { status: 500 }
    );
  }
}