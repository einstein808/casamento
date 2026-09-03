import { NextResponse } from 'next/server';
import { generateAiWeddingMessage } from '@/lib/deepseek';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, tone } = body;

    const message = await generateAiWeddingMessage(
      prompt || 'Mensagem de felicitações para os noivos Fernanda e Gabryel',
      tone || 'friendly'
    );

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar mensagem com IA' },
      { status: 500 }
    );
  }
}
