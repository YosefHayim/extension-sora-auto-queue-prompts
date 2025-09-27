import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import * as admin from "firebase-admin";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { OAuth2Client } from "google-auth-library";
import serviceAccount from "../firebase-admin-credentials.json" with { type: "json" };
import { featureFlags } from "./server-feature-flags";

export const serverConfig = {
  platform: {
    baseUrl: featureFlags.currentEnv === "production" ? "https://mi23aibddp.eu-central-1.awsapprunner.com" : "http://localhost:3000",
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    clientId: process.env.GOOGLE_CLIENT_ID_PROD,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_PROD,
    redirectUri: featureFlags.currentEnv === "production" ? process.env.GOOGLE_REDIRECT_URI : "http://localhost:3000/api/auth/google/callback",
  },
  ebay: {
    clientId: featureFlags.currentEnv === "production" ? process.env.EBAY_CLIENT_ID_PROD : process.env.EBAY_CLIENT_ID_SANDBOX,
    clientSecret: featureFlags.currentEnv === "production" ? process.env.EBAY_CLIENT_SECRET_ID_PROD : process.env.EBAY_CLIENT_SECRET_SANDBOX,
    redirectUri: featureFlags.currentEnv === "production" ? process.env.EBAY_REDIRECT_URI_PROD : process.env.EBAY_REDIRECT_URI_SANDBOX,
  },
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    databaseURL: process.env.FIREBASE_DB_URL,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  },
};

export const oAuth2Client = new OAuth2Client({
  clientId: serverConfig.google.clientId,
  clientSecret: serverConfig.google.clientSecret,
  redirectUri: serverConfig.google.redirectUri,
});

const firebaseApp = getApps().length === 0 ? initializeApp(serverConfig.firebase) : getApps()[0];
export const fireBaseDb = getFirestore(firebaseApp);

const fireBaseAdminApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: serverConfig.firebase.databaseURL,
});

export const adminRole = fireBaseAdminApp.auth();

export const fireBaseAdminDb = getAdminFirestore();
