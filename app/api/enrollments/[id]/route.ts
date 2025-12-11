import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    
    const result = await query(
        `DELETE FROM "Enrollment" WHERE id = $1 RETURNING id`,
        [id]
    );

    if (result.rowCount === 0) {
        return NextResponse.json({ message: 'Inscripción no encontrada.' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Inscripción cancelada correctamente' });
  } catch (error) {
    console.error("Error al cancelar inscripción:", error);
    return NextResponse.json({ message: 'Error al cancelar la inscripción.' }, { status: 500 });
  }
}

export async function PUT() {
    return NextResponse.json({ message: 'Método PUT no implementado.' }, { status: 501 });
}
