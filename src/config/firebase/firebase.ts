import admin from "firebase-admin";
import dotenv from "dotenv";
import serviceAccountJson from "./serviceAccount.json";

dotenv.config();

function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Option 1: Use imported JSON directly (no parsing needed)
  const serviceAccount = serviceAccountJson as admin.ServiceAccount;

  // FIX PRIVATE KEY FORMAT (if loading from env var as string)
  if (serviceAccount.privateKey) {
    serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, "\n");
  }

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
// export const storage = admin.storage().bucket();

export default admin;