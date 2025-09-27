"use client";

import { getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

export const clientConfig = {
  platform: {
    baseUrl: process.env.NEXT_PUBLIC_NODE_ENV === "production" ? "https://mi23aibddp.eu-central-1.awsapprunner.com" : "http://localhost:3000",
  },
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
};

export const firebaseClientApp = getApps().length === 0 ? initializeApp(clientConfig.firebase) : getApps()[0];

export const fireBaseClientAuth = getAuth(firebaseClientApp);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");
googleProvider.setDefaultLanguage("en");
