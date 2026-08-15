# Connecting Wild Quiz to Firestore

## 1. Create a Firebase project
1. Go to https://console.firebase.google.com and click **Add project**.
2. Give it a name (e.g. `wild-quiz`). You can disable Google Analytics — not needed here.

## 2. Create the Firestore database
1. In the left sidebar: **Build > Firestore Database > Create database**.
2. Choose a location close to you, and start in **test mode** for now (we'll lock it down in step 5).

## 3. Register a Web app and get your config
1. Click the gear icon (top left) > **Project settings**.
2. Under "Your apps", click the **</>** (Web) icon to register a new web app. Nickname it anything, e.g. `wild-quiz-web`.
3. Firebase will show you a `firebaseConfig` object with your `apiKey`, `projectId`, etc.
4. Copy those values into `firebase-config.js` in this project, replacing the placeholder strings.

It's fine for these values to be public in your frontend code — Firestore security comes from the Rules (step 5), not from hiding this config.

## 4. Upload your 100 questions (one-time)
Because `migrate.html` uses JS modules, it needs to be served over `http://` or `https://` — opening the file directly (`file://...`) won't work. Easiest options:
- Run a local server: in this folder, run `python3 -m http.server 8000`, then visit `http://localhost:8000/migrate.html`
- Or push everything to GitHub Pages first, visit `migrate.html` there once, then delete it (step 6)

Steps:
1. Open `migrate.html` in your browser (via a server, as above).
2. Click **"Upload questions to Firestore"**.
3. Watch the log — it should upload all 100 questions one by one.
4. In the Firebase console, go to **Firestore Database > Data** and confirm you now see a `questions` collection with 100 documents.

## 5. Lock down your security rules
Once the upload is confirmed, go to **Firestore Database > Rules** and set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /questions/{questionId} {
      allow read: if true;   // anyone can read questions (needed for the quiz to work)
      allow write: if false; // nobody can write from the browser anymore
    }
  }
}
```

Click **Publish**. This means players can only read questions, never modify them.

## 6. Clean up
Delete (or just stop linking to) `migrate.html` and `migrate.js` — you don't need them anymore, and with write rules now locked down they won't work anyway.

## 7. Test the real quiz
Open `index.html` (again via a local server, or GitHub Pages) and click **Start the quiz**. It will now fetch 20 random questions from Firestore instead of the local `questions.js` file. Everything else — shuffling, scoring, the paw trail, the review screen — behaves exactly as before.

`questions.js` itself is no longer loaded by `index.html`; it's now only used by `migrate.html` for the one-time upload, so you can keep it around for that or delete it after migrating.
