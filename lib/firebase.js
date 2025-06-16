import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
   apiKey: "AIzaSyCQY3RXldNJ0lQE723DtaKieKYW-A773eY",
   authDomain: "collabx-e9d2f.firebaseapp.com",
   projectId: "collabx-e9d2f",
   storageBucket: "collabx-e9d2f.firebasestorage.app",
   messagingSenderId: "189921716411",
   appId: "1:189921716411:web:17425df60a4ad66c01619e",
   measurementId: "G-F3NKD2NWYM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;