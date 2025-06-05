import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        field: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    // Check if the field is available for the requested time slot
    const existingBooking = await prisma.booking.findFirst({
      where: {
        fieldId: json.fieldId,
        date: json.date,
        NOT: {
          status: 'Đã hủy',
        },
        OR: [
          {
            AND: [
              { startTime: { lte: json.startTime } },
              { endTime: { gt: json.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: json.endTime } },
              { endTime: { gte: json.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: json.startTime } },
              { endTime: { lte: json.endTime } },
            ],
          },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Field is not available for the selected time slot' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId: json.userId,
        fieldId: json.fieldId,
        date: json.date,
        startTime: json.startTime,
        endTime: json.endTime,
        totalPrice: json.totalPrice,
        paymentMethod: json.paymentMethod,
      },
      include: {
        user: true,
        field: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}