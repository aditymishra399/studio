
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "whispertext-2jbmc",
  appId: "1:765883214993:web:ee9a3896e304c191e36330",
  storageBucket: "whispertext-2jbmc.appspot.com",
  apiKey: "AIzaSyC4B5rSZBsHR157PxMtAakY_HrZ23of-PU",
  authDomain: "whispertext-2jbmc.firebaseapp.com",
  messagingSenderId: "765883214993",
  measurementId: "G-XXXXXXXXXX"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
