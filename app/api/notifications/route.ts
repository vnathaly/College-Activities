import { NextResponse } from 'next/server';
import pool, { query } from '@/lib/db'; // Usamos pool para transacciones, query para GET

// GET: Obtiene todas las notificaciones
export async function GET() {
  try {
    const result = await query(
      `SELECT id, "userId", type, message, read, "sentAt"
       FROM "Notification"
       ORDER BY "sentAt" DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener notificaciones' }, { status: 500 });
  }
}

// POST: Crea una nueva notificación con corrección de ID y Transacción
export async function POST(request: Request) {
  const client = await pool.connect(); 

  try {
    const data = await request.json();
    const { message, type, userId } = data;

    await client.query('BEGIN'); // 1. Iniciar Transacción

    // ✅ CORRECCIÓN CLAVE: Inserción explícita de ID y campo de tiempo ("sentAt").
    // Asumimos que la columna 'id' no está en el listado, por lo que la incluimos.
    const newNotifResult = await client.query(
      `INSERT INTO "Notification" (
         id, "userId", type, message, "sentAt"
       )
       VALUES (
         uuid_generate_v4(), $1, $2, $3, CURRENT_TIMESTAMP
       ) 
       RETURNING id, message, type`,
      [userId || null, type, message]
    );

    await client.query('COMMIT'); // 2. Commit si fue exitoso

    return NextResponse.json(newNotifResult.rows[0], { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK'); // 3. Rollback si falla
    console.error("Error al enviar notificación (ROLLBACK):", error);
    
    return NextResponse.json({ message: 'Error interno al enviar notificación' }, { status: 500 });
  } finally {
    client.release(); // 4. Liberar cliente
  }
}
