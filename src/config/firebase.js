import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getDatabase } from "firebase/database"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiDXZruANLfhnlVmUSSZ2LzOuQ-MskPoU",
  authDomain: "esim-b2b.firebaseapp.com",
  databaseURL: "https://esim-b2b-default-rtdb.firebaseio.com",
  projectId: "esim-b2b",
  storageBucket: "esim-b2b.firebasestorage.app",
  messagingSenderId: "794924414061",
  appId: "1:794924414061:web:60506a96d276eb78513b64",
  measurementId: "G-GZ26YMVB5L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);



export const database = getDatabase(app)

// Analytics
export const analytics = getAnalytics(app)