import { initializeApp as initializeClientApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  deleteUser
} from "firebase/auth";

import admin from "firebase-admin";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// ----------- Firebase Client SDK -----------
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const clientApp = initializeClientApp(firebaseConfig);
const auth = getAuth(clientApp);

// ----------- Firebase Admin SDK -----------
// If FIREBASE_SERVICE_ACCOUNT is a path to the JSON file
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./src/config/serviceAccountKey.json";

const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve(serviceAccountPath), "utf-8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = getAdminFirestore();

export {
  clientApp as app,
  auth,
  db,
  admin,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  deleteUser
};
