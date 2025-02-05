import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from "dotenv";
import admin from "firebase-admin";
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, '../../firebase/FirebaseService.json');

const serviceAccount = await readFile(serviceAccountPath, { encoding: 'utf8' });

const serviceAccountJson = JSON.parse(serviceAccount);

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountJson),
});

const db = getFirestore();

export { db, admin, getAuth, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail };

