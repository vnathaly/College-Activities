import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const events = await prisma.activity.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener eventos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, description, date, place, maxCapacity } = data;

    const newEvent = await prisma.activity.create({
      data: {
        title,
        description,
        date: new Date(date), 
        place,
        maxCapacity: Number(maxCapacity),
        category: 'General', 
        responsible: 'Admin', 
        status: 'active'
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear evento' }, { status: 500 });
  }
}