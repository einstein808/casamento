import { NextResponse } from 'next/server';
import { EvolutionApiClient } from '@/lib/evolution-api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message, settings } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Telefone e mensagem são obrigatórios.' },
        { status: 400 }
      );
    }

    const client = new EvolutionApiClient(settings);
    const result = await client.sendTextMessage(phone, message);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao conectar com Evolution API' },
      { status: 500 }
    );
  }
}
