import { NextResponse } from 'next/server';
import { db, COLLECTIONS } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_SETTINGS } from '@/lib/default-data';
import { WeddingSettings } from '@/lib/types';

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS });
    }
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'main_settings'));
    if (snap.exists()) {
      return NextResponse.json({ success: true, settings: snap.data() });
    }
    return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS });
  } catch (error: any) {
    console.error('Error fetching settings API:', error);
    return NextResponse.json({ success: false, settings: DEFAULT_SETTINGS, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = body.settings as WeddingSettings;
    if (!settings) {
      return NextResponse.json({ success: false, error: 'Settings object is required' }, { status: 400 });
    }
    if (db) {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'main_settings'), settings);
    }
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error saving settings API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
