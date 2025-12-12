import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db'; 

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
  const client = await pool.connect();

  try {
    const data = await request.json();
    const { name, email, role, password, matricula } = data; 

    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    await client.query('BEGIN'); 

    const newUserResult = await client.query(
      `INSERT INTO "User" (
         id, matricula, email, "passwordHash", "firstName", "lastName", "userType", "createdAt", "updatedAt"
       ) 
       VALUES (
         uuid_generate_v4(), $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
       ) 
       RETURNING id, email, "userType"`,
      [matricula, email, password, firstName, lastName, role]
    );

    await client.query('COMMIT'); 

    return NextResponse.json(newUserResult.rows[0], { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al crear usuario (ROLLBACK):", error);
    
    if (error && typeof error === 'object' && 'code' in error && (error.code === '23505' || error.code === '23502')) {
         return NextResponse.json({ message: 'La matrícula o el correo ya están registrados.' }, { status: 409 });
    }
    
    return NextResponse.json({ message: 'Error interno al crear usuario.' }, { status: 500 });
  } finally {
    client.release();
  }
}
