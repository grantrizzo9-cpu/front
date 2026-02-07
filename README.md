# Affiliate AI Host - Core Restoration Guide (v1.2.0)

Your site is currently showing "Hello world" because a **Cloudflare Worker** is intercepting your domain. Follow these exact steps to kill the interceptor and go live.

---

## 🛠️ Step 1: Kill the "Hello World" Interceptor (CRITICAL)
Based on your dashboard screenshot:
1. Click on the project named **"front"** (the one with the blue lightning bolt icon).
2. On the left sidebar, click **Settings**.
3. Click on the **Triggers** tab.
4. Look for the section named **"Custom Domains"**. 
5. You will see `hostproai.com` listed there. Click the **three dots (...)** next to it and select **DELETE**.
6. This "unplugs" the "Hello world" script from your domain.

---

## ☁️ Step 2: Set up Cloudflare Pages (The Real Site)
Once the Worker is unplugged, you need to make sure the **Pages** version is active:
1. Go back to the **Workers & Pages** overview.
2. Click the **Pages** tab (next to the Workers tab).
3. Click **Connect to Git** and select your `front` repository.
4. **Build Settings**:
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
5. Go to the **Custom domains** tab of this **Pages** project and add `hostproai.com`.

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