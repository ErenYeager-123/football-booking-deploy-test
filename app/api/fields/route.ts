import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const fields = await prisma.field.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(fields);
  } catch (error) {
    console.error('Error fetching fields:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    const field = await prisma.field.create({
      data: {
        name: json.name,
        description: json.description,
        location: json.location,
        imageUrl: json.imageUrl,
        pricePerHour: json.pricePerHour,
        size: json.size,
        amenities: json.amenities,
        isAvailable: json.isAvailable ?? true,
      },
    });

    return NextResponse.json(field);
  } catch (error) {
    console.error('Error creating field:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}