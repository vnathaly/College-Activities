import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) { 
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'Se requiere el ID del usuario.' }, { status: 400 });
    }

    const result = await query(
      `SELECT 
         E.id AS "enrollmentId", 
         E."createdAt" AS "enrollmentDate",
         A.id, A.title, A.description, A.date, A.place, A.category 
       FROM "Enrollment" E
       JOIN "Activity" A ON E."activityId" = A.id
       WHERE E."userId" = $1
       ORDER BY A.date ASC`, 
      [userId]
    );

    const enrolledActivities = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
      place: row.place,
      category: row.category,
      enrollmentId: row.enrollmentId,
      enrollmentDate: row.enrollmentDate.toISOString(),
    }));

    return NextResponse.json(enrolledActivities, { status: 200 });
  } catch (error) {
    console.error("Error al obtener inscripciones:", error);
    return NextResponse.json({ message: 'Error interno al obtener inscripciones.' }, { status: 500 });
  }
}
