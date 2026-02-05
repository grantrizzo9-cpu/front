
# Affiliate AI Host - AWS Amplify Deployment Guide

Your application is hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## ⚠️ CRITICAL: DO NOT Use the Firebase Hosting Wizard
If the Firebase Console asks you to **"Add records"** or **"Remove records (13.249.x.x)"**, **DO NOT DO IT**. 
Those `13.249` records are your **Amazon (AWS)** records. If you follow the Firebase Hosting wizard, you will break your AWS deployment.

---

## 🌐 How to fix the "Backend Connection Failed" / "Client Offline" error
If your site loads but fails to create an account, follow these steps in order:

### Step 1: Authorize Domain in Firebase Auth (COMPLETED ✅)
*You have already added `hostproai.com`. Ensure you also add `*.hostproai.com` for complete coverage.*
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select **Authentication** -> **Settings** -> **Authorized domains**.
3. Add `*.hostproai.com`.

### Step 2: Whitelist in Google Cloud (Required for Database/Firestore)
*This is the final step once your Google Cloud account is verified.*
1. Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
2. Select project **`rent-a-host-a55fd`**.
3. Edit the key named **"Browser key (auto-created by Firebase)"**.
4. Scroll to **"Website restrictions"**.
5. Add `https://hostproai.com/*` and `https://*.hostproai.com/*`.
6. Click **Save**. 

---

## 🛡️ Amazon Firewall / WAF Note
The application is using **Long Polling (v1.0.4)**, which uses standard HTTPS traffic to bypass AWS firewall restrictions. You can keep your AWS WAF enabled.

---

## 🛠️ Required AWS Amplify Secrets
Ensure these are set in **Amplify Console** -> **App Settings** -> **Environment Variables**:

| Variable Name | Value Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Your key from Google AI Studio |
| `PAYPAL_SANDBOX` | Use `true` for testing, `false` for live |
| `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID` | PayPal Client ID (Frontend) |
| `PAYPAL_SANDBOX_CLIENT_ID` | PayPal Client ID (Backend) |
| `PAYPAL_SANDBOX_CLIENT_SECRET` | PayPal Client Secret |

---

## 🚀 Push Changes
Run these commands in your terminal to deploy the latest connectivity fixes:

1. `git add .`
2. `git commit -m "Connectivity fix v1.0.4: Enhanced Long Polling and UI navigation"`
3. `git push origin main`

© 2025 Affiliate AI Host. All rights reserved.
