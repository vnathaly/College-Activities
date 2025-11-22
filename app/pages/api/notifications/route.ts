
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const notifs = await prisma.notification.findMany({
      orderBy: { sentAt: 'desc' },
    });
    return NextResponse.json(notifs);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener notificaciones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { message, type, userId } = data;

    const newNotif = await prisma.notification.create({
      data: {
        message,
        type,
        userId: userId || null, 
        read: false,
      },
    });

    return NextResponse.json(newNotif, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al enviar notificación' }, { status: 500 });
  }
}
