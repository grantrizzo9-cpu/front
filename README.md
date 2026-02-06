# Affiliate AI Host - Core Restoration Guide (v1.1.9)

Your site is currently showing "Hello world" because of two reasons: a Cloudflare Worker is intercepting your domain, or incorrect build settings. Follow these steps exactly to fix it.

---

## 🚀 Step 1: Sync Your Code correctly
Run these commands in your terminal **one by one**. Do NOT use commas or run them as a single line.

1. `git add .`
2. `git commit -m "Restore System v1.1.9"`
3. `git push origin main`

---

## 🛠️ Step 2: Remove the "Hello World" Interceptor (CRITICAL)
Your screenshot shows a **Worker** record for `hostproai.com`. This is what is showing "Hello world."
1. Go to your **Cloudflare Dashboard**.
2. Go to **Workers & Pages** -> **Overview**.
3. Look for a Worker named **"front"**.
4. Click on it, go to the **Settings** or **Triggers** tab, and **Remove the Route** for `hostproai.com`. 
5. The DNS record should ideally be managed by your **Pages** project, not a manual Worker.

---

## ☁️ Step 3: Configure Cloudflare Pages
1. Go to your **Cloudflare Dashboard > Pages**.
2. Select your project and go to **Custom domains**. Ensure `hostproai.com` is added here.
3. Go to **Settings > Build & deployments**. Click **Edit**:
   - **Framework preset**: Select `Next.js`.
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Deploy command**: (LEAVE THIS COMPLETELY EMPTY)
4. Click **Save** and trigger a **Retry deployment**.

---

## 🔐 Step 4: Authorize Domain in Firebase
The database will **NOT** work until you do this:
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Authentication** -> **Settings** -> **Authorized domains**.
3. Add `hostproai.com`.

© 2025 Affiliate AI Host. Core Restored.
