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
  console.error("Error loading firebase config in server init:", err);
}

const projectId = firebaseConfig.projectId || "pixelflow-ai-d62d8";

if (!getApps().length) {
  try {
    initializeApp({
      projectId: projectId,
      credential: admin.credential.applicationDefault()
    });
  } catch (err) {
    console.warn("Could not load Application Default Credentials, initializing admin with projectId only:", err);
    initializeApp({
      projectId: projectId
    });
  }
}

export const db = admin.firestore();
export const storage = admin.storage();
export { admin, firebaseConfig };
