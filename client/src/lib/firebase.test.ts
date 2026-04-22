import { describe, it, expect, beforeAll } from "vitest";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

describe("Firebase Configuration", () => {
  it("should have Firebase environment variables configured", () => {
    expect(import.meta.env.VITE_FIREBASE_API_KEY).toBeDefined();
    expect(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN).toBeDefined();
    expect(import.meta.env.VITE_FIREBASE_PROJECT_ID).toBeDefined();
    expect(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET).toBeDefined();
    expect(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID).toBeDefined();
    expect(import.meta.env.VITE_FIREBASE_APP_ID).toBeDefined();
  });

  it("should initialize Firebase app with correct config", () => {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    expect(firebaseConfig.projectId).toBe("ponto-af926");
    expect(firebaseConfig.authDomain).toBe("ponto-af926.firebaseapp.com");
  });

  it("should have valid Firebase project ID format", () => {
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    // Firebase project IDs are typically lowercase alphanumeric with hyphens
    expect(/^[a-z0-9-]+$/.test(projectId)).toBe(true);
  });

  it("should have valid API key format", () => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    // Firebase API keys are typically long alphanumeric strings
    expect(apiKey.length).toBeGreaterThan(20);
  });
});
