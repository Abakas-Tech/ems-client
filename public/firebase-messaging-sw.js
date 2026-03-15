// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyAXOvXTNKIYqgrsdZpgKQ2UKv0jGNaRzYU",
  authDomain: "test-a786f.firebaseapp.com",
  projectId: "test-a786f",
  storageBucket: "test-a786f.firebasestorage.app",
  messagingSenderId: "433216555117",
  appId: "1:433216555117:web:dba88d3de445c730375764",
  measurementId: "G-7652995NSN",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// This handles the message when the tab is CLOSED or in the BACKGROUND
messaging.onBackgroundMessage((payload) => {
  console.log("Background Message Received:", payload);

  // const notificationTitle = payload.notification.title;
  // const notificationOptions = {
  //   body: payload.notification.body,
  //   icon: "/image.png",
  //   data: { url: "/admin/notifications" },
  // };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
