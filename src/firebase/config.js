import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9k5GGAS5VDOFZdwxCqi13hAedjHGwhLA",
  authDomain: "comingbro-f441b.firebaseapp.com",
  projectId: "comingbro-f441b",
  storageBucket: "comingbro-f441b.firebasestorage.app",
  messagingSenderId: "552099572549",
  appId: "1:552099572549:web:628c679b46aabf02482c2c",
  measurementId: "G-YTG9G7XTX6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
