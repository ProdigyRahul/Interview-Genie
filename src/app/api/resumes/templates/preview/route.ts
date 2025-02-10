import { NextRequest, NextResponse } from 'next/server';
import { generateTemplatePreview } from '@/lib/templates/preview-generator';
import { TemplateType } from '@/lib/templates/latex/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const template = searchParams.get('template') as TemplateType;

    if (!template || !['modern', 'classic', 'minimalist'].includes(template)) {
      return NextResponse.json(
        { error: 'Invalid template type' },
        { status: 400 }
      );
    }

    const pdfBuffer = await generateTemplatePreview(template);

    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${template}-preview.pdf"`,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      }
    });
  } catch (error) {
    console.error('Error generating template preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
} 