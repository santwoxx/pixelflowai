import admin from 'firebase-admin';
import { getApps, initializeApp } from 'firebase-admin/app';
import path from 'path';
import fs from 'fs';

let firebaseConfig: any = {};
try {
  let firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(firebaseConfigPath)) {
    firebaseConfigPath = path.join(process.cwd(), '..', 'firebase-applet-config.json');
  }
  
  if (fs.existsSync(firebaseConfigPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  } else {
    firebaseConfig = {
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pixelflow-ai-d62d8",
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "pixelflow-ai-d62d8.firebasestorage.app"
    };
  }
} catch (err) {
  console.error("Error loading firebase config:", err);
}

const projectId = firebaseConfig.projectId || "pixelflow-ai-d62d8";
const storageBucket = firebaseConfig.storageBucket || "pixelflow-ai-d62d8.firebasestorage.app";

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Production: use service account credentials from environment variables (Render/Vercel)
      initializeApp({
        projectId,
        storageBucket,
        credential: admin.credential.cert({
          projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('[Firebase Admin] Initialized with service account credentials.');
    } else {
      // Local development: attempt Application Default Credentials (gcloud auth)
      initializeApp({
        projectId,
        storageBucket,
        credential: admin.credential.applicationDefault()
      });
      console.log('[Firebase Admin] Initialized with Application Default Credentials.');
    }
  } catch (err) {
    console.warn("Firebase Admin init failed, running in limited mode:", err);
    initializeApp({ projectId, storageBucket });
  }
}

export const db = admin.firestore();
export const storage = admin.storage();
export { admin, firebaseConfig };

