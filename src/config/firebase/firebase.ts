import admin from "firebase-admin";
import dotenv from "dotenv";
import serviceAccountJson from "./serviceAccount.json";

dotenv.config();

function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const accountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccount = JSON.parse(accountJson as any) as admin.ServiceAccount;

  // FIX PRIVATE KEY FORMAT
  if (serviceAccount.privateKey) {
    serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, "\n");
  }

  //   const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  //   if (!bucketName) {
  //     throw new Error("FIREBASE_STORAGE_BUCKET environment variable is not set");
  //   }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // storageBucket: bucketName,
  });
}

// INITIALIZE FIREBASE
const app = initializeFirebase();

// EXPORTS
export const db = admin.firestore();
export const auth = admin.auth();
// export const storage = admin.storage().bucket();

export default admin;
