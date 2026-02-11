
# Affiliate AI Host - Firebase Hosting Launch Guide (v1.4.0)

Your domain `hostproai.com` is connected! Follow these steps to finish the terminal login and push your code live.

---

## 🛠️ Step 1: Complete the Terminal Login
You are currently at the login step. **Do not paste commands into the authorization prompt.**

1.  **Run Login**: Type `firebase login --no-localhost` and press **Enter**.
2.  **Answer Prompts**: Type `Y` for the prompts until you see a URL.
3.  **Get the CODE**: Copy the URL, open it in your browser, log in, and click **Allow**.
4.  **COPY the Code**: You will see a long string of random characters (the Authorization Code). **Copy it.**
5.  **PASTE the Code**: Go back to your terminal. When it says `Enter authorization code:`, paste **ONLY the string** you just copied and press **Enter**.

---

## 🏗️ Step 2: Set Project Context
Once the terminal says "Success! Logged in", run this command to tell Firebase which project to use:
`firebase use rent-a-host-a55fd`

---

## 🚀 Step 3: Deploy to hostproai.com
Run the final command to build and upload your site:
`firebase deploy`

---

## 🔑 Important Check
**API Key**: Ensure you have pasted your **New API Key** from Google Cloud into `src/firebase/config.ts`.
- Replace `"REPLACE_WITH_NEW_KEY"` with your actual key string (the one ending in `4qdA` or your new one).

---

© 2025 Affiliate AI Host. Firebase Hosting Sync v1.4.0.
