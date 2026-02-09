import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientName, clientPhone, clientEmail, caseType, preferredTime, attorneyOfficeId, sourcePageUrl } = body;

    if (!clientName || !clientEmail) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        clientName,
        clientPhone: clientPhone || null,
        clientEmail,
        caseType: caseType || null,
        preferredTime: preferredTime || null,
        attorneyOfficeId: attorneyOfficeId || null,
        sourcePageUrl: sourcePageUrl || null,
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error: any) {
    console.error('Lead creation error:', error);
    return NextResponse.json(
      { error: 'Failed to submit lead' },
      { status: 500 }
    );
  }
}
