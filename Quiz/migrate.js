import { db } from "./firestore.js";
import {
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const btn = document.getElementById("btn-migrate");
const log = document.getElementById("log");

function print(line) {
  log.textContent += line + "\n";
  log.scrollTop = log.scrollHeight;
}

btn.addEventListener("click", async () => {
  btn.disabled = true;
  print(`Starting upload of ${QUESTION_BANK.length} questions...\n`);

  let uploaded = 0;
  let failed = 0;

  for (const item of QUESTION_BANK) {
    try {
      await addDoc(collection(db, "questions"), {
        q: item.q,
        o: item.o,
        a: item.a,
      });
      uploaded++;
      print(`[${uploaded}/${QUESTION_BANK.length}] Uploaded: ${item.q}`);
    } catch (err) {
      failed++;
      print(`FAILED: ${item.q} — ${err.message}`);
    }
  }

  print(`\nDone. Uploaded ${uploaded}, failed ${failed}.`);
  if (failed === 0) {
    print(
      "\nNow: go lock down your Firestore rules to read-only (see instructions), " +
      "then you can delete migrate.html and migrate.js."
    );
  }
  btn.disabled = false;
});
