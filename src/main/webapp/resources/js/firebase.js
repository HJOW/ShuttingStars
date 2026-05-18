/** Firebase 모듈 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js'

// If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js'

// Add Firebase products that you want to use
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js'
const firebaseConfig = {
  apiKey: "",
  authDomain: "shuttingstars-3eddf.firebaseapp.com",
  projectId: "shuttingstars-3eddf",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};
const app = initializeApp(firebaseConfig);