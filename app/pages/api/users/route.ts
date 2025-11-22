import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    const formattedUsers = users.map(u => ({
      id: u.id,
      matricula: u.matricula, 
      name: `${u.firstName} ${u.lastName}`.trim(),
      email: u.email,
      role: u.userType,
      password: u.passwordHash,
      status: "active"
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener usuarios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, role, password, matricula } = data; 

    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUser = await prisma.user.create({
      data: {
        matricula, 
        email,
        passwordHash: password,
        firstName,
        lastName,
        userType: role,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al crear usuario (posible matrícula duplicada)' }, { status: 500 });
  }
}