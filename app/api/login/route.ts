import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; 

const checkPassword = (submitted: string, storedHash: string): boolean => {
    return submitted === storedHash; 
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json({ message: 'Correo y contraseña son obligatorios.' }, { status: 400 });
    }
    
    const result = await query(
      `SELECT id, email, "userType", "firstName", "lastName", "passwordHash" 
       FROM "User" 
       WHERE email = $1`, 
      [email.trim()]
    );

    const user = result.rows[0];

    if (!user) {
        return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    const isPasswordValid = checkPassword(password, user.passwordHash);

    if (!isPasswordValid) {
        return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    const safeUser = {
        id: user.id,
        email: user.email,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
    };

    return NextResponse.json({ 
        message: 'Inicio de sesión exitoso', 
        user: safeUser 
    });

  } catch (error) {
    console.error('Error durante la autenticación:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
