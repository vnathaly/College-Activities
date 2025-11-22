import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const data = await request.json();
    const { title, description, date, place, maxCapacity } = data;

    const updatedEvent = await prisma.activity.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        place,
        maxCapacity: Number(maxCapacity),
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    return NextResponse.json({ message: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.activity.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Evento eliminado' });
  } catch (error) {
    console.error("Error eliminando evento:", error);
    return NextResponse.json({ message: 'Error al eliminar' }, { status: 500 });
  }
}
