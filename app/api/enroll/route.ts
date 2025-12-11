import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) { 
  try {
    const data = await request.json();
    const { userId, activityId }: { userId: string, activityId: string } = data;

    if (!userId || !activityId) {
      return NextResponse.json({ message: 'Faltan IDs de usuario o actividad.' }, { status: 400 });
    }

    // 1. Verificar si ya está inscrito
    const existingResult = await query(
      `SELECT id FROM "Enrollment" WHERE "userId" = $1 AND "activityId" = $2`,
      [userId, activityId]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ message: 'Ya estás inscrito en esta actividad.' }, { status: 409 });
    }

    // 2. Obtener el título de la actividad
    const activityResult = await query(
        `SELECT title FROM "Activity" WHERE id = $1`,
        [activityId]
    );
    const activityTitle = activityResult.rows[0]?.title || 'Evento';

    // 3. Crear la nueva inscripción
    const newEnrollmentResult = await query(
      `INSERT INTO "Enrollment" ("userId", "activityId") VALUES ($1, $2) RETURNING id`,
      [userId, activityId]
    );
    const newEnrollment = newEnrollmentResult.rows[0];

    // 4. CREAR LA NOTIFICACIÓN ASOCIADA
    await query(
        `INSERT INTO "Notification" ("userId", type, message) VALUES ($1, $2, $3)`,
        [userId, 'info', `¡Te has inscrito exitosamente en la actividad: ${activityTitle}!`]
    );

    return NextResponse.json(newEnrollment, { status: 201 });
  } catch (error) {
    console.error("Error al inscribir:", error);
    return NextResponse.json({ message: 'Error interno al procesar la inscripción.' }, { status: 500 });
  }
}
