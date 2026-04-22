import { describe, it, expect } from "vitest";

describe("Firebase Configuration", () => {
  it("should have Firebase environment variables configured", () => {
    expect(process.env.VITE_FIREBASE_API_KEY).toBeDefined();
    expect(process.env.VITE_FIREBASE_AUTH_DOMAIN).toBeDefined();
    expect(process.env.VITE_FIREBASE_PROJECT_ID).toBeDefined();
    expect(process.env.VITE_FIREBASE_STORAGE_BUCKET).toBeDefined();
    expect(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID).toBeDefined();
    expect(process.env.VITE_FIREBASE_APP_ID).toBeDefined();
  });

  it("should have valid Firebase project ID", () => {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    expect(projectId).toBe("ponto-af926");
  });

  it("should have valid Firebase auth domain", () => {
    const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN;
    expect(authDomain).toBe("ponto-af926.firebaseapp.com");
  });

  it("should have valid API key format", () => {
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    expect(apiKey).toBeDefined();
    expect(typeof apiKey).toBe("string");
    expect(apiKey!.length).toBeGreaterThan(20);
  });

  it("should have valid storage bucket", () => {
    const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET;
    expect(storageBucket).toBe("ponto-af926.firebasestorage.app");
  });

  it("should have valid messaging sender ID", () => {
    const messagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
    expect(messagingSenderId).toBe("880185927479");
  });

  it("should have valid app ID", () => {
    const appId = process.env.VITE_FIREBASE_APP_ID;
    expect(appId).toBe("1:880185927479:web:53df9ce864718bf6501cb2");
  });
});
