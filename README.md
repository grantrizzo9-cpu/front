
# Affiliate AI Host - Firebase Hosting Launch Guide (v1.3.8)

Your domain is connected! Follow these steps to resolve the authentication error and push your code live to `hostproai.com`.

---

## 🛠️ Step 1: Fix the Authentication Error
The error "Failed to authenticate" means you need to link your terminal to your Google account.

1.  **Run Login**:
    `firebase login --no-localhost`
2.  **Copy the Link**: The terminal will give you a long URL. Copy it and open it in your browser.
3.  **Authorize**: Log in with your Google account and grant permissions.
4.  **Paste the Code**: You will get an authorization code. Paste it back into your terminal and press Enter.

---

## 🚀 Step 2: Prepare your API Key
Since you are no longer using Render, you must ensure your **New API Key** is active in the code.

1.  Ensure your **Google Cloud Console** allows `https://hostproai.com/*` in the "Website restrictions" for your API Key.
2.  Check `src/firebase/config.ts` to ensure the key is correctly referenced.

---

## 🏗️ Step 3: Deploy to hostproai.com
Once logged in, run these commands in your terminal:

1.  **Select Project**:
    `firebase use rent-a-host-a55fd`
2.  **Deploy**:
    `firebase deploy`

---

## 🔑 Troubleshooting "Site Not Found"
If you see "Site Not Found" after deploying:
1.  Check the Firebase Console -> Hosting to see if the deploy was successful.
2.  Wait 2-5 minutes for the global cache to update.
3.  Ensure your domain is verified in the Firebase Hosting dashboard.

---

© 2025 Affiliate AI Host. Firebase Hosting Sync v1.3.8.
