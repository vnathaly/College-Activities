import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sqlQuery = `
      SELECT 
        EXTRACT(YEAR FROM date) AS year,
        EXTRACT(MONTH FROM date) AS month,
        COUNT(id) AS "activityCount"
      FROM "Activity"
      GROUP BY year, month
      ORDER BY year ASC, month ASC;
    `;
    
    const result = await query(sqlQuery);

    const formattedData = result.rows.map(row => ({
      year: parseInt(row.year, 10),
      month: parseInt(row.month, 10),
      activityCount: parseInt(row.activityCount, 10),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error al generar reporte mensual:", error);
    return NextResponse.json({ message: 'Error al obtener datos del gráfico mensual.' }, { status: 500 });
  }
}