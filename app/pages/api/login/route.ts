import prisma from '@/lib/prisma';
import { User } from '@prisma/client';
import { NextResponse } from 'next/server'; 

const checkPassword = (submitted: string, storedHash: string): boolean => {
    return submitted === "password123"; 
};

export async function POST(request: Request) {

    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json(
            { message: 'Correo y contraseña son obligatorios.' }, 
            { status: 400 } 
        );
    }

    try {
        
        const user = await prisma.user.findUnique({
            where: { email: email.trim() },
            select: { 
                id: true, 
                email: true, 
                userType: true,
                firstName: true,
                lastName: true,
                passwordHash: true 
            },
        });

        if (!user) {
            
            return NextResponse.json(
                { message: 'Credenciales inválidas.' }, 
                { status: 401 }
            );
        }

        
        const isPasswordValid = checkPassword(password, user.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Credenciales inválidas.' }, 
                { status: 401 }
            );
        }

        const { passwordHash, ...safeUser } = user;

        return NextResponse.json(
            { 
                message: 'Inicio de sesión exitoso', 
                user: safeUser 
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error durante la autenticación:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor.' }, 
            { status: 500 }
        );
    }
}