import { NextResponse } from 'next/server';
import { db, COLLECTIONS } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

    if (db) {
      const guestRef = doc(db, COLLECTIONS.GUESTS, guestId);
      const snap = await getDoc(guestRef);
      const existing = snap.exists() ? snap.data() : {};
      const updated = {
        ...existing,
        id: guestId,
        status: status || existing.status || 'confirmed',
        confirmedCompanions: confirmedCompanions || [],
        dietRestrictions: dietRestrictions || '',
        message: message || '',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(guestRef, updated, { merge: true });
      return NextResponse.json({ success: true, guest: updated });
    }

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

