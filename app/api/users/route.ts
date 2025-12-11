import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT id, matricula, email, "firstName", "lastName", "userType" AS role, "passwordHash" AS password
       FROM "User" 
       ORDER BY "createdAt" DESC`
    );
    
    const formattedUsers = result.rows.map(u => ({
      id: u.id,
      matricula: u.matricula,
      name: `${u.firstName} ${u.lastName}`.trim(),
      email: u.email,
      role: u.role,
      password: u.password,
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

    const newUserResult = await query(
      `INSERT INTO "User" (matricula, email, "passwordHash", "firstName", "lastName", "userType") 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, "userType"`,
      [matricula, email, password, firstName, lastName, role]
    );

    return NextResponse.json(newUserResult.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al crear usuario (posible matrícula duplicada)' }, { status: 500 });
  }
}
