import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sqlQuery = `
      SELECT 
        E.id AS "enrollmentId",
        E."createdAt" AS "enrollmentDate",
        U.matricula,
        U."firstName" || ' ' || U."lastName" AS "userName",
        U.email AS "userEmail",
        A.title AS "activityTitle",
        A.date AS "activityDate",
        A.place AS "activityPlace",
        A.category AS "activityCategory"
      FROM "Enrollment" E
      JOIN "User" U ON E."userId" = U.id
      JOIN "Activity" A ON E."activityId" = A.id
      ORDER BY E."createdAt" DESC;
    `;
    
    const result = await query(sqlQuery);

    const formattedData = result.rows.map(row => ({
      ...row,
      enrollmentDate: row.enrollmentDate.toISOString(),
      activityDate: row.activityDate.toISOString(),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error al generar reporte de inscripciones:", error);
    return NextResponse.json({ message: 'Error al obtener datos del reporte de inscripciones.' }, { status: 500 });
  }
}
