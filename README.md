
# Affiliate AI Host - AWS Amplify Deployment Guide

Your application is hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## ⚠️ CRITICAL: DO NOT Use the Firebase Hosting Wizard
If the Firebase Console asks you to **"Add records"** or **"Remove records (13.249.x.x)"**, **DO NOT DO IT**. 
Those `13.249` records are your **Amazon (AWS)** records. If you follow the Firebase Hosting wizard, you will break your AWS deployment.

---

## 🌐 How to fix the "Backend Connection Failed" / "Client Offline" error
If your site loads but says "Offline" or fails to create an account, your Firebase backend is rejecting the connection from your domain. You must complete BOTH steps below.

### Step 1: Authorize Domain in Firebase Auth (Free & Immediate)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`rent-a-host-a55fd`**.
3. Go to **Build** -> **Authentication** -> **Settings** -> **Authorized domains**.
4. Click **Add domain** and enter: `hostproai.com`.
5. Click **Add domain** again and enter: `*.hostproai.com`.
*This tells Firebase Auth that your AWS domain is "safe".*

### Step 2: Whitelist in Google Cloud (Required for Database/Firestore)
Even if you did Step 1, Firestore will fail unless you do this:
1. Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
2. Select project **`rent-a-host-a55fd`**.
3. Edit the key named **"Browser key (auto-created by Firebase)"**.
4. Scroll to **"Website restrictions"**.
5. Add `https://hostproai.com/*` and `https://*.hostproai.com/*`.
6. Click **Save**. 
*Note: It can take up to 5 minutes for Google to update this global restriction.*

---

## 🛠️ Required AWS Amplify Secrets
Add these in **Amplify Console** -> **App Settings** -> **Environment Variables**:

| Variable Name | Value Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Your key from Google AI Studio |
| `PAYPAL_SANDBOX` | Use `true` for testing, `false` for live |
| `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID` | PayPal Client ID (Frontend) |
| `PAYPAL_SANDBOX_CLIENT_ID` | PayPal Client ID (Backend) |
| `PAYPAL_SANDBOX_CLIENT_SECRET` | PayPal Client Secret |
| `OPENSRS_API_KEY` | Your key for OpenSRS domain registration |

---

## 🚀 Push Changes
1. `git add .`
2. `git commit -m "Fix build errors and update technical guide"`
3. `git push origin main`

© 2024 Affiliate AI Host. All rights reserved.
