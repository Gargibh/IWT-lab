// Sets up the Firestore connection and exposes a simple getQuestions()
// helper that both quiz.js and migrate.js can import.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Cache so replaying the quiz (btn-restart) doesn't re-fetch every time.
let cachedBank = null;

export async function getQuestions() {
  if (cachedBank) return cachedBank;

  const snapshot = await getDocs(collection(db, "questions"));
  cachedBank = snapshot.docs.map((doc) => doc.data()); // each: { q, o, a }

  if (cachedBank.length === 0) {
    throw new Error(
      "No questions found in Firestore. Did you run migrate.html yet?"
    );
  }
  return cachedBank;
}
