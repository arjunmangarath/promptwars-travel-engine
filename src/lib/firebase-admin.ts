import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | null = null;
let db: Firestore | null = null;

function initAdmin(): App {
  if (getApps().length > 0) return getApps()[0];
  app = initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT || "promptwars-live" });
  return app;
}

export function getAdminDb(): Firestore {
  if (db) return db;
  initAdmin();
  db = getFirestore();
  return db;
}
