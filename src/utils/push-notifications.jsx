import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { registerPushToken } from "../domains/admin/api/notification.api"; 

const firebaseConfig = {
  apiKey: "AIzaSyAXOvXTNKIYqgrsdZpgKQ2UKv0jGNaRzYU",
  authDomain: "test-a786f.firebaseapp.com",
  projectId: "test-a786f",
  storageBucket: "test-a786f.firebasestorage.app",
  messagingSenderId: "433216555117",
  appId: "1:433216555117:web:dba88d3de445c730375764",
  measurementId: "G-7652995NSN"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const setupPushNotifications = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Get the FCM token
      const token = await getToken(messaging, {
        vapidKey:
          "BEPL8s4Q_W1kb6ZrRqQd4p2v3p_jLB_9VOG1oLsJvyvh0EXrypGQqVjBZ908ZZecQ2VJVaNCEEVt6FRi_bH-E2s",
      });

      if (token) {
        // Send to your backend /register-token endpoint
        await registerPushToken(
          {
            token,
            device_name: navigator.userAgent,
            browser_type: "chrome",
          },
        );
        console.log("Token registered successfully");
      }
    }
  } catch (error) {
    console.error("Error setting up push notifications:", error);
  }
};

// Listen for foreground messages (app is open)
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
