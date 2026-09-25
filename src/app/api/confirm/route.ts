import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, action, reason } = body;

    if (!token || !action) {
      return NextResponse.json({ error: 'Missing token or action' }, { status: 400 });
    }

    // --- PRISMA LOGIC (Uncomment when Prisma is connected) ---
    /*
    // 1. Find the Participant using the secure unique token
    const participant = await prisma.participant.findUnique({
      where: { secureToken: token },
      include: { tournament: true, member: true }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    if (participant.tournament.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Tournament is no longer accepting responses' }, { status: 400 });
    }

    // 2. Update Status Based on Action
    if (action === 'confirm') {
      await prisma.$transaction([
        prisma.participant.update({
          where: { id: participant.id },
          data: { attendanceStatus: 'CONFIRMED' }
        }),
        prisma.member.update({
          where: { id: participant.memberId },
          data: { tournamentsConfirmed: { increment: 1 } }
        })
      ]);
      
      // TODO: Trigger queue job to send "Confirmation Received" WhatsApp message
      
      return NextResponse.json({ success: true, message: 'Confirmed successfully' });
    } 
    
    else if (action === 'decline') {
      await prisma.$transaction([
        prisma.participant.update({
          where: { id: participant.id },
          data: { 
            attendanceStatus: 'DECLINED',
            declineReason: reason || null
          }
        }),
        prisma.member.update({
          where: { id: participant.memberId },
          data: { tournamentsDeclined: { increment: 1 } }
        })
      ]);
      
      // Note: As per architecture, declining before tournament does NOT count as a no-show penalty.
      
      return NextResponse.json({ success: true, message: 'Declined successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    */

    // Simulated success for preview mode
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Confirmation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
