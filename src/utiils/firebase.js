import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAi_5pVEYsjHOn6nrFyJKtsa0bA3h6wSKs",
    authDomain: "blog-app-18073.firebaseapp.com",
    projectId: "blog-app-18073",
    storageBucket: "blog-app-18073.firebasestorage.app",
    messagingSenderId: "8583834783",
    appId: "1:8583834783:web:3319fc1a0c4c47e3d206aa",
    measurementId: "G-EVRQE9EJQK"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const getFcmToken = async () => {
    try {
        const token = await getToken(messaging, {
            vapidKey: "BBepicx70YF4pLFb-l9vLXrzbLiOVs93UfQrVUf5qgTzKzFVEPLOxeS9bwjRgXbACbEgbNltffsnQDDXy8ssit8",
        });
        return token;
    } catch (err) {
        console.log("FCM error:", err);
        return null;
    }
};

export const listenForegroundMessage = () => {
    onMessage(messaging, (payload) => {
        console.log("Foreground message:", payload);

        alert(payload.notification?.title + "\n" + payload.notification?.body);
    });
};