import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBA_O91Uspp183DR820-8YRnJawSmHrXTU",
    authDomain: "digitalgatepassmanagement.firebaseapp.com",
    projectId: "digitalgatepassmanagement",
    storageBucket: "digitalgatepassmanagement.firebasestorage.app",
    messagingSenderId: "700617010527",
    appId: "1:700617010527:web:4feec124a4a9db66221aea",
    measurementId: "G-YQH5VRD3KP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app; 