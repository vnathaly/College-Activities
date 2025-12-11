import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const data = await request.json();
    const { name, email, role, password } = data;

    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const fields = [];
    const values = [];
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

    const result = await query(updateQuery, values);

    if (result.rowCount === 0) {
        return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ message: 'Error al actualizar usuario.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    const result = await query(
        `DELETE FROM "User" WHERE id = $1 RETURNING id`,
        [id]
    );

    if (result.rowCount === 0) {
        return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Usuario eliminado' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar usuario' }, { status: 500 });
  }
}
