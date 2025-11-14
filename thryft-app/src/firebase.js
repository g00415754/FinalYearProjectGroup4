import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// 🔧 Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYDsWSk-okMQ-cFcth-edV-lFABKtzLzo",
  authDomain: "thryft-app-b2270.firebaseapp.com",
  projectId: "thryft-app-b2270",
  storageBucket: "thryft-app-b2270.appspot.com",
  messagingSenderId: "798439046806",
  appId: "1:798439046806:web:1b519b1b0d9c68235e0cb7",
  measurementId: "G-ENXJQ96CHT"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// ✅ Connect to emulators only when running locally
if (window.location.hostname === "localhost") {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
  //connectAuthEmulator(auth, "http://localhost:9099");
}
