import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7VVGeimlVhMZiCp7KjRK7r2C_NppAJaQ",
  authDomain: "elvora-4e10f.firebaseapp.com",
  projectId: "elvora-4e10f",
  storageBucket: "elvora-4e10f.firebasestorage.app",
  messagingSenderId: "767424126098",
  appId: "1:767424126098:web:756cd5098b0075b923da4b",
  measurementId: "G-BPSL6QZ2TE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
