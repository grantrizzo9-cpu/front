
# Affiliate AI Host - Railway Deployment Guide

Your application is now configured for deployment on **Railway**.

## 🚀 How to Deploy to Railway

1.  **Push to GitHub**: Railway automatically deploys when you push code to your repository.
2.  **Connect to Railway**: 
    - Go to [railway.app](https://railway.app).
    - Create a "New Project" -> "Deploy from GitHub repo".
    - Select `grantrizzo9-cpu/front`.
3.  **Set Environment Variables**: 
    - In your Railway project, go to **Variables**.
    - Add the variables from your `.env` file (e.g., `GEMINI_API_KEY`, `PAYPAL_SANDBOX_CLIENT_ID`, etc.).

---

## 🌐 Fixing the "Client Offline" error on hostproai.com

Even on Railway, if you use a custom domain, you must complete these steps:

### Step 1: Authorize Domain in Firebase Auth (COMPLETED ✅)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select **Build** -> **Authentication** -> **Settings** -> **Authorized domains**.
3. You have already added `hostproai.com`. This is correct.

### Step 2: Whitelist in Google Cloud (Required for Database)
*Note: This requires your Google Cloud account to be active.*
1. Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
2. Select project **`rent-a-host-a55fd`**.
3. Edit the key named **"Browser key (auto-created by Firebase)"**.
4. Scroll to **"Website restrictions"**.
5. Add `https://hostproai.com/*` and `https://*.hostproai.com/*`.
6. Click **Save**. 

---

## 🛠️ Push Changes to GitHub
Run these commands in your terminal to sync your local code with GitHub and trigger the Railway deployment:

1. `git remote set-url origin https://github.com/grantrizzo9-cpu/front.git`
2. `git add .`
3. `git commit -m "Deployment fix v1.0.4: Re-optimized for Railway"`
4. `git push origin main`

© 2025 Affiliate AI Host. All rights reserved.
