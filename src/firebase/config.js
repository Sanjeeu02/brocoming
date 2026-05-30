import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDQ3v9Q0l3wRPkxzFd6IcxH9PCsglP-WNs",
  authDomain: "fun-app-8edf9.firebaseapp.com",
  projectId: "fun-app-8edf9",
  storageBucket: "fun-app-8edf9.firebasestorage.app",
  messagingSenderId: "243331703727",
  appId: "1:243331703727:web:a567ebef0f2fe32033455a",
  measurementId: "G-B5MDVCGS63"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { auth, db, analytics };
