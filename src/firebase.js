import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD26ViDCZUA8sRzeW4M06eZ6n_ZQRcRHEE",
  authDomain: "krs-autofinance.firebaseapp.com",
  projectId: "krs-autofinance",
  // Check your Firebase Console -> Storage tab. 
  // If the bucket name ends in .appspot.com, update this line.
  storageBucket: "krs-autofinance.firebasestorage.app",
  messagingSenderId: "177876354594",
  appId: "1:177876354594:web:df480d26a98f2ac10b6c7b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
