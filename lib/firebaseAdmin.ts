// Firebase Admin SDK (server-side only) - used by API routes
import admin from 'firebase-admin';

let initialized = false;

export function getAdmin() {
  if (!initialized && !admin.apps.length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      // Admin SDK not configured - some server-side operations will be limited
      console.warn('[firebaseAdmin] Missing FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY - admin operations disabled');
      return null;
    }

    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    initialized = true;
  }
  return admin.apps.length ? admin : null;
}

export function getAdminDb() {
  const a = getAdmin();
  return a ? a.firestore() : null;
}

export function getAdminAuth() {
  const a = getAdmin();
  return a ? a.auth() : null;
}
