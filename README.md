# Affiliate AI Host - Final Deployment Guide (v1.1.9)

Follow these steps exactly to ensure your site is live and the database is connected.

---

## 🚀 Step 1: Sync Your Code
Run these commands in your terminal one by one:
1. `git add .`
2. `git commit -m "Restore System v1.1.9"`
3. `git push origin main`

---

## ☁️ Step 2: Configure Cloudflare Pages
To fix the "Hello World" or "Build Failed" issues:
1. Go to your **Cloudflare Dashboard > Pages**.
2. Click on your project and go to **Settings > Build & deployments**.
3. Under **Build configuration**, click **Edit**:
   - **Framework preset**: Select `Next.js`.
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Deploy command**: (LEAVE THIS COMPLETELY EMPTY)
4. Go to **Settings > Variables and Secrets**:
   - Change `NEXT_PUBLIC_APP_URL` to `https://hostproai.com`.

---

## 🔐 Step 3: Authorize Domain in Firebase (REQUIRED)
The database will **NOT** work until you do this:
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Authentication** -> **Settings** -> **Authorized domains**.
3. Add `hostproai.com`.
4. Add your `.pages.dev` URL.

---

## 🛠️ Step 4: Google Cloud API Key Restrictions
1. Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit **"Browser key (auto-created by Firebase)"**.
3. Under **"Website restrictions"**, ensure you have these exact lines:
   - `https://hostproai.com/*`
   - `https://*.pages.dev/*`
4. Click **Save**.

© 2025 Affiliate AI Host. Core Restored.