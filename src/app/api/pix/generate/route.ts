import { NextResponse } from 'next/server';
import { generatePixPayload, generatePixQrCode } from '@/lib/pix';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pixKey, merchantName, merchantCity, amount, description } = body;

    if (!pixKey || !amount) {
      return NextResponse.json(
        { success: false, error: 'Chave PIX e valor são obrigatórios.' },
        { status: 400 }
      );
    }

    const payload = generatePixPayload({
      pixKey,
      merchantName: merchantName || 'NOIVOS',
      merchantCity: merchantCity || 'BRASIL',
      amount: Number(amount),
      description: description || 'Presente de Casamento',
    });

    const qrCode = await generatePixQrCode(payload);

    return NextResponse.json({
      success: true,
      payload,
      qrCode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar PIX' },
      { status: 500 }
    );
  }
}
