import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestId, status, confirmedCompanions, dietRestrictions, message } = body;

    if (!guestId || !status) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos para confirmação.' },
        { status: 400 }
      );
    }

    // In a full Firebase production backend, this writes to Firestore:
    // await db.collection('guests').doc(guestId).update({ status, confirmedCompanions, dietRestrictions, message });

    return NextResponse.json({
      success: true,
      message: 'Presença atualizada com sucesso!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar RSVP' },
      { status: 500 }
    );
  }
}
