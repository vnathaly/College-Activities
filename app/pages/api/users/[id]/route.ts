import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { name, email, role, password, matricula } = data;

    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        matricula,
        email,
        firstName,
        lastName,
        userType: role,
        passwordHash: password,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    await prisma.user.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return NextResponse.json({ message: 'Error al eliminar' }, { status: 500 });
  }
}
