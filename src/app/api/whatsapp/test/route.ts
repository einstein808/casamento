import { NextResponse } from 'next/server';
import { EvolutionApiClient } from '@/lib/evolution-api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, settings } = body;

    const client = new EvolutionApiClient(settings);
    
    if (phone) {
      const testMsg = `💍 *Teste de Conexão - Casamento*\n\n` +
        `Olá! Esta é uma mensagem de teste enviada a partir do painel do seu site de casamento.\n\n` +
        `Se você recebeu esta mensagem, sua integração com a *Evolution API (WhatsApp)* está 100% configurada e funcionando perfeitamente! 🚀✨`;
      
      const result = await client.sendTextMessage(phone, testMsg);
      return NextResponse.json(result);
    } else {
      const result = await client.testConnection();
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao testar conexão com Evolution API' },
      { status: 500 }
    );
  }
}
