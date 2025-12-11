import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT id, title, description, date, place, "maxCapacity", category, responsible, status 
       FROM "Activity" 
       ORDER BY date ASC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener actividades' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, description, date, place, maxCapacity, category, responsible } = data;

    const newEventResult = await query(
      `INSERT INTO "Activity" (title, description, date, place, "maxCapacity", category, responsible)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, new Date(date), place, maxCapacity, category || 'General', responsible || 'Admin']
    );

    return NextResponse.json(newEventResult.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al crear evento' }, { status: 500 });
  }
}
