
# Affiliate AI Host - AWS Amplify Deployment Guide

Your application is hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## ⚠️ CRITICAL: DO NOT Use the Firebase Hosting Wizard
If the Firebase Console asks you to **"Add records"** or **"Remove records (13.249.x.x)"**, **DO NOT DO IT**. 
Those `13.249` records are your **Amazon (AWS)** records. If you follow the Firebase Hosting wizard, you will break your AWS deployment.

---

## 🌐 How to fix the "Backend Connection Failed" / "Client Offline" error
If your site loads but fails to create an account, follow these steps in order:

### Step 1: Authorize Domain in Firebase Auth (COMPLETED ✅)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select **Build** -> **Authentication** -> **Settings** -> **Authorized domains**.
3. You have already added `hostproai.com`. This is correct.

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

## 🚀 Push Changes to GitHub
Run these commands in your terminal to deploy the latest fixes to your repository:

1. `git remote set-url origin https://github.com/grantrizzo9-cpu/front.git`
2. `git add .`
3. `git commit -m "Connectivity fix v1.0.4: Final Long Polling and README update"`
4. `git push origin main`

© 2025 Affiliate AI Host. All rights reserved.
