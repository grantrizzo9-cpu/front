
# Affiliate AI Host - Ultimate Deployment Guide (v1.2.2)

Your app is now optimized for **Cloudflare Pages** and **Render**. Follow these final steps to go live.

---

## ⚡ Scenario A: Deploying to Cloudflare Pages (RECOMMENDED)
If your build failed with `Error: Output directory "next" not found`:

1.  In the Cloudflare Dashboard, go to your **Pages Project > Settings > Build & deployments**.
2.  Click **"Edit output directory"**.
3.  Change it from `next` to `.vercel/output` (include the dot).
4.  **Save** and **Retry build**.

---

## 🚀 Scenario B: Deploying to Render
If you are seeing a login error on your Render domain (`front-h603.onrender.com`):

1.  **Step 1 (Firebase)**: Go to [Firebase Console](https://console.firebase.google.com/) > **Authentication > Settings > Authorized Domains**.
2.  Click **"Add domain"** and paste: `front-h603.onrender.com`.
3.  **Step 2 (Google Cloud)**: If login still says "referer blocked" (like in your screenshot), click the **orange alert box** that now appears on your login page. It will take you to Google Cloud where you need to add `https://front-h603.onrender.com/*` to your **API Key Website Restrictions**.

---

## ✅ Step 1: Sync the Final Code Fixes
Run these commands in your terminal here in Studio to sync the Version 1.2.2 fixes:

1. `git add .`
2. `git commit -m "Deployment Recovery v1.2.2"`
3. `git push origin main`

---

© 2025 Affiliate AI Host. Final Sync v1.2.2.
