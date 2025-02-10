import { NextRequest, NextResponse } from 'next/server';
import { generateTemplatePreview } from '@/lib/templates/preview-generator';
import { renderToString } from 'react-dom/server';

export async function POST(req: NextRequest) {
  try {
    const { template } = await req.json();

    if (!template) {
      return NextResponse.json(
        { error: 'Template type is required' },
        { status: 400 }
      );
    }

    const previewComponent = await generateTemplatePreview(template);
    if (!previewComponent) {
      return NextResponse.json(
        { error: 'Failed to generate preview' },
        { status: 500 }
      );
    }

    const html = renderToString(previewComponent);
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
} 