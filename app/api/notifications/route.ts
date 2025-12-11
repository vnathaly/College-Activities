import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT id, "userId", type, message, read, "sentAt"
       FROM "Notification"
       ORDER BY "sentAt" DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener notificaciones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { message, type, userId } = data;

    const newNotifResult = await query(
      `INSERT INTO "Notification" ("userId", type, message)
       VALUES ($1, $2, $3) RETURNING id, message, type`,
      [userId || null, type, message]
    );

    return NextResponse.json(newNotifResult.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al enviar notificación' }, { status: 500 });
  }
}
