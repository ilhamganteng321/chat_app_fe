/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAi_5pVEYsjHOn6nrFyJKtsa0bA3h6wSKs",
    authDomain: "blog-app-18073.firebaseapp.com",
    projectId: "blog-app-18073",
    storageBucket: "blog-app-18073.firebasestorage.app",
    messagingSenderId: "8583834783",
    appId: "1:8583834783:web:3319fc1a0c4c47e3d206aa",
    measurementId: "G-EVRQE9EJQK"
});

const messaging = firebase.messaging();

// Handle pesan saat app di background
messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Background message:", payload);

    const title = payload.notification?.title || "Pesan Baru";
    const options = {
        body: payload.notification?.body || "Ada pesan baru",
        
        // bebas
    };

    self.registration.showNotification(title, options);
});