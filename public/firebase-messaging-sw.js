// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAXOvXTNKIYqgrsdZpgKQ2UKv0jGNaRzYU",
  authDomain: "test-a786f.firebaseapp.com",
  projectId: "test-a786f",
  storageBucket: "test-a786f.firebasestorage.app",
  messagingSenderId: "433216555117",
  appId: "1:433216555117:web:dba88d3de445c730375764",
  measurementId: "G-7652995NSN",
});

const messaging = firebase.messaging();

// SINGLE listener for background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received", payload);

  const notificationTitle = payload.notification.title || "New Notification";
  const notificationOptions = {
    body: payload.notification.body || "You have a new update",
    icon: "/image.png", // Use the same icon as your foreground notification
    badge: "/image.png", // The small icon shown in the status bar on mobile
    tag: payload.messageId, // CRITICAL: Prevents duplicate popups for the same message
    data: payload.data, // Pass data through so you can handle clicks
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
