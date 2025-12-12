import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db'; // Usamos pool para transacciones, query para GET

// GET: Obtiene todos los eventos
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

// POST: Crea un nuevo evento con transacción y manejo de UUIDs
export async function POST(request: Request) {
  const client = await pool.connect(); // Obtener cliente dedicado para transacción

  try {
    const data = await request.json();
    const { title, description, date, place, maxCapacity, category, responsible } = data;

    await client.query('BEGIN'); // 1. Iniciar Transacción

    // ✅ CORRECCIÓN FINAL DE INSERCIÓN:
    // Aseguramos que 'id' se genere con uuid_generate_v4() y que
    // 'createdAt'/'updatedAt' reciban CURRENT_TIMESTAMP.
    const newEventResult = await client.query(
      `INSERT INTO "Activity" (
         id, title, description, date, place, "maxCapacity", category, responsible, "createdAt", "updatedAt"
       )
       VALUES (
         uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
       ) RETURNING *`,
      [title, description, new Date(date), place, maxCapacity, category || 'General', responsible || 'Admin']
    );

    await client.query('COMMIT'); // 2. Commit si fue exitoso

    return NextResponse.json(newEventResult.rows[0], { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK'); // 3. Rollback si falla
    console.error("Error al crear actividad (ROLLBACK):", error);
    
    return NextResponse.json({ message: 'Error interno al crear actividad' }, { status: 500 });
  } finally {
    client.release(); // 4. Liberar cliente
  }
}
