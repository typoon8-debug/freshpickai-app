import admin from "firebase-admin";
import type { Messaging } from "firebase-admin/messaging";

let messagingInstance: Messaging | null = null;

export function getFirebaseMessaging(): Messaging {
  if (messagingInstance) return messagingInstance;

  if (!admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT 환경변수가 설정되지 않았습니다.");
    }

    const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  messagingInstance = admin.messaging();
  return messagingInstance;
}
