import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// ===============================
//            PUT
// ===============================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();

  try {
    const { id } = await params; // ⬅️ NECESARIO EN NEXT 14+

    if (!id) {
      return NextResponse.json({ message: 'ID de evento faltante.' }, { status: 400 });
    }

    const data = await request.json();
    const { title, description, date, place, maxCapacity } = data;

    await client.query('BEGIN');

    const updatedEventResult = await client.query(
      `UPDATE "Activity" 
       SET title = $1,
           description = $2,
           date = $3,
           place = $4,
           "maxCapacity" = $5,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, new Date(date), place, Number(maxCapacity), id]
    );

    if (updatedEventResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'Evento no encontrado.' }, { status: 404 });
    }

    await client.query('COMMIT');
    return NextResponse.json(updatedEventResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar (ROLLBACK):', error);
    return NextResponse.json({ message: 'Error al actualizar' }, { status: 500 });
  } finally {
    client.release();
  }
}

// ===============================
//           DELETE
// ===============================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();

  try {
    const { id } = await params; // ⬅️ OBLIGATORIO

    if (!id) {
      return NextResponse.json({ message: 'ID de evento faltante.' }, { status: 400 });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `DELETE FROM "Activity" WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'Evento no encontrado.' }, { status: 404 });
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Evento eliminado' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar (ROLLBACK):', error);
    return NextResponse.json({ message: 'Error al eliminar' }, { status: 500 });
  } finally {
    client.release();
  }
}
