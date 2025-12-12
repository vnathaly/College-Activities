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
      return NextResponse.json({ message: 'ID de usuario faltante.' }, { status: 400 });
    }

    const data = await request.json();
    const { name, email, role, password } = data;

    const nameParts = name ? name.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (firstName) {
      fields.push(`"firstName" = $${paramIndex++}`);
      values.push(firstName);
    }
    if (lastName) {
      fields.push(`"lastName" = $${paramIndex++}`);
      values.push(lastName);
    }
    if (email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (role) {
      fields.push(`"userType" = $${paramIndex++}`);
      values.push(role);
    }
    if (password) {
      fields.push(`"passwordHash" = $${paramIndex++}`);
      values.push(password);
    }

    if (fields.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'No hay datos para actualizar.' }, { status: 400 });
    }

    fields.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    values.push(id);

    const updateQuery = `
      UPDATE "User"
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, "userType"
    `;

    await client.query('BEGIN');
    const result = await client.query(updateQuery, values);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    await client.query('COMMIT');
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json({ message: 'Error al actualizar usuario.' }, { status: 500 });
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
    const { id } = await params; // ⬅️ FIX IMPORTANTE

    if (!id) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'ID de usuario faltante.' }, { status: 400 });
    }

    await client.query('BEGIN');

    const result = await client.query(
      `DELETE FROM "User" WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Usuario eliminado' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json({ message: 'Error al eliminar usuario' }, { status: 500 });
  } finally {
    client.release();
  }
}
