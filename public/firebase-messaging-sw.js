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

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/og-image.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// THIS IS THE KEY FOR BACKGROUND
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received", payload);

  const notificationTitle = payload.notification.title || "New Message";
  const notificationOptions = {
    body: payload.notification.body || "You have a new update",
    icon: "/logo192.png", // Make sure this exists in public folder
  };

  // This command forces the browser to show the system popup
  self.registration.showNotification(notificationTitle, notificationOptions);
});
