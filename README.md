
# Affiliate AI Host - AWS Amplify Deployment Guide

Your application is hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## 🌐 Pointing Your Domain to AWS (Route 53)
Since you have moved your nameservers to Amazon, you must connect the domain inside the AWS console:
1.  Log in to the **[AWS Amplify Console](https://console.aws.amazon.com/amplify/home)**.
2.  Select your app: **`rent-a-host`**.
3.  Go to **App Settings** -> **Domain management**.
4.  Click **Add domain** and enter: `hostproai.com`.
5.  If your domain is in the same AWS account (Route 53), Amplify will offer to configure DNS automatically. **Accept this.**
6.  If not, it will provide **CNAME records**. Add these to your **Route 53 Hosted Zone** for `hostproai.com`.

---

## 🚨 FIX: "Backend Connection Failed" / "Client Offline"
If your live site displays an "Offline" message, your Firebase backend is rejecting the connection from your new domain.

### Step 1: Authorize Domain in Firebase Console (Immediate Fix)
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project: **`rent-a-host-a55fd`**.
3.  Go to **Build** -> **Authentication** -> **Settings** -> **Authorized domains**.
4.  Click **Add domain** and enter: `hostproai.com`.
5.  Click **Add domain** again and enter: `*.hostproai.com`.

### Step 2: Whitelist in Google Cloud Console (Critical Security)
Once your Google Cloud account is approved, you must perform this step to allow API access:
1.  Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
2.  Select project **`rent-a-host-a55fd`**.
3.  Edit the **"Browser key (auto-created by Firebase)"**.
4.  Under **"Website restrictions"**, add `https://hostproai.com/*` and `https://*.hostproai.com/*`.
5.  Click **Save**.

---

## 🛠️ Required AWS Environment Variables
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
2. `git commit -m "Fix AWS build errors and update domain guide"`
3. `git push origin main`

© 2024 Affiliate AI Host. All rights reserved.
