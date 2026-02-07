# Affiliate AI Host - Core Restoration Guide (v1.2.0)

Your site is currently showing "Hello world" because a **Cloudflare Worker** is intercepting your domain. Follow these exact steps to kill the interceptor and go live.

---

## 🛠️ Step 1: Kill the "Hello World" Interceptor (CRITICAL)
1. Go to your **Cloudflare Dashboard**.
2. On the left sidebar, click **Workers & Pages**.
3. Look for the Worker named **"front"** (the one from your screenshot). Click on it.
4. Go to the **Settings** tab inside that worker.
5. Click on the **Triggers** sub-tab.
6. Look for the section named **"Custom Domains"**. 
7. If you see `hostproai.com` listed there, click **...** and select **DELETE**.
8. This "unplugs" the "Hello world" script from your domain.

---

## ☁️ Step 2: Set up Cloudflare Pages (The Real Site)
1. In the same **Workers & Pages** section, click the **Pages** tab (not Workers).
2. Click **Connect to Git** and select your `front` repository.
3. **Build Settings**:
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Deploy command**: (KEEP THIS COMPLETELY EMPTY)
4. Go to the **Custom domains** tab of this **Pages** project and add `hostproai.com`.

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
