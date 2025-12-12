import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sqlQuery = `
      SELECT 
        A.id, 
        A.title, 
        A.date, 
        A."maxCapacity", 
        A.category,
        COUNT(E.id) AS "enrollmentCount"
      FROM "Activity" A
      LEFT JOIN "Enrollment" E ON A.id = E."activityId"
      GROUP BY A.id
      ORDER BY "enrollmentCount" DESC, A.date ASC;
    `;
    
    const result = await query(sqlQuery);

    const formattedData = result.rows.map(row => ({
      ...row,
      enrollmentCount: parseInt(row.enrollmentCount, 10),
      date: row.date.toISOString(), 
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error al generar reporte detallado:", error);
    return NextResponse.json({ message: 'Error al obtener datos del reporte detallado.' }, { status: 500 });
  }
}
