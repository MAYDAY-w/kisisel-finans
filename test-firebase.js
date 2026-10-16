import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgYglx1NyXPabqPHhyYGqzAYxn4QqEnI8",
  authDomain: "kisisel-finans-dc340.firebaseapp.com",
  projectId: "kisisel-finans-dc340",
  storageBucket: "kisisel-finans-dc340.firebasestorage.app",
  messagingSenderId: "1025822802816",
  appId: "1:1025822802816:web:0504e5c173e829e45f7765"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Attempting to write to users/testuser...");
    await setDoc(doc(db, 'users', 'testuser'), {
      test: true,
      timestamp: new Date().toISOString()
    }, { merge: true });
    console.log("Success!");
  } catch (e) {
    console.error("Firebase Error:", e);
  }
}

test();
