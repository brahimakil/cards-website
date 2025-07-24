import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCB-MenQtwImozj5AGrehtcDre2btGXKsU",
  authDomain: "card-system-82afc.firebaseapp.com",
  projectId: "card-system-82afc",
  storageBucket: "card-system-82afc.firebasestorage.app",
  messagingSenderId: "672046297379",
  appId: "1:672046297379:web:b335c68c0cf4b4bbf3dc96",
  measurementId: "G-NBSQV4B3J3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app; 