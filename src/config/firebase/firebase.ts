import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountEnv) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
  }

  const serviceAccount = JSON.parse(serviceAccountEnv);
  
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