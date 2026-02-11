
# Affiliate AI Host - Firebase Hosting Launch Guide (v1.3.7)

Your domain is connected! Follow these steps to replace the "Site Not Found" page with your actual app.

---

## 🚀 Step 1: Prepare your Environment
1.  Ensure your local `.env` file has the **New API Key** you created.
2.  The API Key should be in `NEXT_PUBLIC_FIREBASE_API_KEY`.

## 🛠️ Step 2: Deploy to Firebase
Run these commands in your terminal to push your code to the live domain:

1.  **Login to Firebase**:
    `firebase login`
2.  **Initialize (if not done)**:
    `firebase use --add` (Select your project: `rent-a-host-a55fd`)
3.  **Deploy**:
    `firebase deploy`

---

## 🔑 Step 3: API Key Whitelist (Custom Domain)
Since you are now on Firebase Hosting, ensure your API Key in [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials) allows:
*   `https://hostproai.com/*`
*   `https://rent-a-host-a55fd.web.app/*`
*   `https://rent-a-host-a55fd.firebaseapp.com/*`

---

© 2025 Affiliate AI Host. Firebase Hosting Sync v1.3.7.
