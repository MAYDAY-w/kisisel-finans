import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, writeBatch } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgYglx1NyXPabqPHhyYGqzAYxn4QqEnI8",
  authDomain: "kisisel-finans-dc340.firebaseapp.com",
  projectId: "kisisel-finans-dc340",
  storageBucket: "kisisel-finans-dc340.firebasestorage.app",
  messagingSenderId: "1025822802816",
  appId: "1:1025822802816:web:0504e5c173e829e45f7765",
  measurementId: "G-FG9FGD8BMX"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const registerWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = () => signOut(auth);
