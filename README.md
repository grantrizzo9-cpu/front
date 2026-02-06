# Affiliate AI Host - Core Restoration Guide (v1.1.9)

Your site is currently showing "Hello world" because the last Cloudflare deployment failed. Follow these steps exactly to fix it.

---

## 🚀 Step 1: Sync Your Code correctly
Run these commands in your terminal **one by one**. Do NOT use commas or run them as a single line.

1. `git add .`
2. `git commit -m "Restore System v1.1.9"`
3. `git push origin main`

---

## ☁️ Step 2: Configure Cloudflare Pages (CRITICAL)
If your deployment says "Permission Denied" or "Hello World", your settings are wrong.
1. Go to your **Cloudflare Dashboard > Pages**.
2. Click on your project and go to **Settings > Build & deployments**.
3. Under **Build configuration**, click **Edit**:
   - **Framework preset**: Select `Next.js`.
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Deploy command**: (LEAVE THIS COMPLETELY EMPTY - DELETE EVERYTHING IN THIS BOX)
4. Click **Save**.
5. Go to the **Deployments** tab and click **"Create new deployment"** or **"Retry deployment"**.

---

## 🔐 Step 3: Authorize Domain in Firebase
The database will **NOT** work until you do this:
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Authentication** -> **Settings** -> **Authorized domains**.
3. Add `hostproai.com`.

---

## 🛠️ Step 4: Google Cloud API Key Restrictions
1. Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit **"Browser key (auto-created by Firebase)"**.
3. Under **"Website restrictions"**, ensure you have these exact lines:
   - `https://hostproai.com/*`
   - `https://*.pages.dev/*`
4. Click **Save**.

© 2025 Affiliate AI Host. Core Restored.
