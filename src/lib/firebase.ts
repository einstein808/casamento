import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCHisiNxZa3cGLx7k0bDR20Yv9cE0aHZ_w",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "casamento-6e0c9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "casamento-6e0c9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "casamento-6e0c9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "893063251992",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:893063251992:web:e91bd0aca0a95637ad1b6d",
};

export const isFirebaseConfigured = Boolean(
  (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCHisiNxZa3cGLx7k0bDR20Yv9cE0aHZ_w") && 
  (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "casamento-6e0c9")
);

let app: FirebaseApp;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  console.warn('Erro ao inicializar Firebase:', e);
}

// Scoped collections specifically for the wedding
export const COLLECTIONS = {
  SETTINGS: 'wedding_settings',
  GUESTS: 'wedding_guests',
  GIFTS: 'wedding_gifts',
  PIX_CONTRIBUTIONS: 'wedding_pix_contributions',
  PHOTOS: 'wedding_photos',
};

export { app, db, storage };
