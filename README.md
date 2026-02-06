
# Affiliate AI Host - Final Deployment Guide (v1.1.8)

Follow these steps exactly to ensure your site is live and the database is connected.

---

## 🚀 Step 1: Sync Your Code
Run these commands in your terminal one by one (do not use commas):
1. `git add .`
2. `git commit -m "Final Version 1.1.8: Absolute Velocity"`
3. `git push origin main`

---

## ☁️ Step 2: Configure Cloudflare Settings
1. Go to your project in the **Cloudflare Dashboard**.
2. Go to **Settings > Variables and Secrets**.
3. **CRITICAL**: Find `NEXT_PUBLIC_APP_URL` and change it from `http://localhost:3000` to `https://hostproai.com`.
4. Go to **Settings > Build & deployments**.
5. Ensure the **"Deploy command"** field is completely **EMPTY**. (If Cloudflare forces it, use a single colon `:`).

---

## 🔐 Step 3: Authorize Domain in Firebase (REQUIRED)
The database will **NOT** work until you do this:
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Authentication** -> **Settings** -> **Authorized domains**.
3. Add `hostproai.com`.
4. Add your `.pages.dev` or `.workers.dev` URL (from your Cloudflare screenshot).

---

## 🛠️ Step 4: Fix API Key Restrictions
1. Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit **"Browser key (auto-created by Firebase)"**.
3. Under **"Website restrictions"**, add these two exact lines:
   - `https://hostproai.com/*`
   - `https://*.pages.dev/*`
4. Click **Save**.

---

© 2025 Affiliate AI Host. Absolute-Velocity Enabled.
