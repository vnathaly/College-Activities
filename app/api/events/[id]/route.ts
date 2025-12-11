import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Params {
  params: { id: string };
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const data = await request.json();
    const { title, description, date, place, maxCapacity } = data;

    const updatedEventResult = await query(
      `UPDATE "Activity" 
       SET title = $1, description = $2, date = $3, place = $4, "maxCapacity" = $5, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [title, description, new Date(date), place, Number(maxCapacity), id]
    );

    if (updatedEventResult.rowCount === 0) {
        return NextResponse.json({ message: 'Evento no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(updatedEventResult.rows[0]);
  } catch (error) {
    console.error("Error al actualizar:", error);
    return NextResponse.json({ message: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    const result = await query(
        `DELETE FROM "Activity" WHERE id = $1 RETURNING id`,
        [id]
    );

    if (result.rowCount === 0) {
        return NextResponse.json({ message: 'Evento no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Evento eliminado' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar' }, { status: 500 });
  }
}
