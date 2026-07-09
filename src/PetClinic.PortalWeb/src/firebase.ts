import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDafrTo_f3jE1z-nGtFV-qxPaVuBEkv79k",
  authDomain: "proyecto1-324fa.firebaseapp.com",
  projectId: "proyecto1-324fa",
  storageBucket: "proyecto1-324fa.firebasestorage.app",
  messagingSenderId: "434318687930",
  appId: "1:434318687930:web:c8a0634241861dee804c83",
  measurementId: "G-8Y0M6ML921"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Force prompt to always select account
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
