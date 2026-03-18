import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  
  if (!serviceAccountBase64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set");
  }

  // Decode base64 to JSON string, then parse
  const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
  const serviceAccount = JSON.parse(serviceAccountJson);

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

// INITIALIZE FIREBASE
const app = initializeFirebase();

// EXPORTS
export const db = admin.firestore();
export const auth = admin.auth();

export default admin;
