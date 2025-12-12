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
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'ID de notificación faltante.' }, { status: 400 });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE "Notification"
       SET read = TRUE, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'Notificación no encontrada.' }, { status: 404 });
    }

    await client.query('COMMIT');
    return NextResponse.json(result.rows[0]);
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
    const { id } = await params; // ⬅️ OBLIGATORIO EN NEXT 14

    if (!id) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'ID de notificación faltante.' }, { status: 400 });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `DELETE FROM "Notification"
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'Notificación no encontrada.' }, { status: 404 });
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Notificación eliminada' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar (ROLLBACK):', error);
    return NextResponse.json({ message: 'Error al eliminar' }, { status: 500 });
  } finally {
    client.release();
  }
}
