# Affiliate AI Host - Core Restoration Guide (v1.2.0)

Your site was showing "Hello world" because a **Cloudflare Worker** was intercepting your domain. You have successfully deleted that interceptor. Now, follow these final steps to go live.

---

## ✅ Step 1: Kill the "Hello World" Interceptor (DONE)
You have already deleted `hostproai.com` from the **Worker** triggers. Great job!

---

## ☁️ Step 2: Set up Cloudflare Pages (The Real Site)
Now you need to make sure the **Pages** version is active:
1. Go back to the **Workers & Pages** overview in Cloudflare.
2. Click the **Pages** tab (it has a blue document icon, next to the Workers tab).
3. Click on your **"front"** project (the Pages one).
4. Go to the **Custom domains** tab.
5. Click **Set up a custom domain** and add `hostproai.com`.
6. Follow the instructions to finish the DNS setup.

---

## 🚀 Step 3: Sync Your Code
Run these in your terminal to ensure the latest professional landing page is ready:
1. `git add .`
2. `git commit -m "Restore System v1.2.0"`
3. `git push origin main`

---

## 🔐 Step 4: Authorize Domain in Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Authentication** -> **Settings** -> **Authorized domains**.
3. Add `hostproai.com`.

© 2025 Affiliate AI Host. Core Restored.