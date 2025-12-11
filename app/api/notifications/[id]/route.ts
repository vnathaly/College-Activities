import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    
    const result = await query(
      `UPDATE "Notification" SET read = TRUE WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
        return NextResponse.json({ message: 'Notificación no encontrada.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    
    const result = await query(
        `DELETE FROM "Notification" WHERE id = $1 RETURNING id`,
        [id]
    );

    if (result.rowCount === 0) {
        return NextResponse.json({ message: 'Notificación no encontrada.' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Notificación eliminada' });
  } catch (error) {
    return NextResponse.json({ message: 'Error al eliminar' }, { status: 500 });
  }
}
