
# Affiliate AI Host - AWS Amplify Deployment Guide

Your application is hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## 🌐 IMPORTANT: Point Your Domain to AWS
To connect your domain (`hostproai.com`) to your site, follow these steps in your AWS Console:
1.  Log in to the **[AWS Amplify Console](https://console.aws.amazon.com/amplify/home)**.
2.  Select your app: **`rent-a-host`**.
3.  Go to **App Settings** -> **Domain management**.
4.  Click **Add domain** and enter: `hostproai.com`.
5.  Click **Configure domain**. Amplify will generate **CNAME records**.
6.  Copy these CNAME records and add them to your domain registrar's DNS settings (Shopco/OpenSRS).

---

## 🚨 FIX: "Backend Connection Failed" / "Client Offline"
If your live site displays an "Offline" message, follow these two steps to authorize your domain:

### Step 1: Authorize Domain in Firebase Console (No GCP needed)
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project: **`rent-a-host-a55fd`**.
3.  Go to **Build** -> **Authentication** -> **Settings** -> **Authorized domains**.
4.  Click **Add domain** and enter: `hostproai.com`.
5.  Click **Add domain** again and enter: `*.hostproai.com`.

### Step 2: Whitelist in Google Cloud Console (When account is approved)
1.  Go to the [Google Cloud Console API Credentials](https://console.cloud.google.com/apis/credentials).
2.  Ensure project **`rent-a-host-a55fd`** is selected.
3.  Under **"API Keys"**, click the **Edit** icon next to your **"Browser key (auto-created by Firebase)"**.
4.  Scroll down to the **"Website restrictions"** section.
5.  Add `https://hostproai.com/*` and `https://*.hostproai.com/*`.
6.  Click **Save**.

---

## 🛠️ Required Environment Variables (Secrets)
In your **AWS Amplify Console**, go to **App Settings** -> **Environment Variables**. You **MUST** add these exactly as shown:

| Variable Name | Value Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Your key from Google AI Studio |
| `PAYPAL_SANDBOX` | Use `true` for testing, `false` for live |
| `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID` | PayPal Client ID (Frontend) |
| `PAYPAL_SANDBOX_CLIENT_ID` | PayPal Client ID (Backend) |
| `PAYPAL_SANDBOX_CLIENT_SECRET` | PayPal Client Secret |
| `OPENSRS_API_KEY` | Your key for OpenSRS domain registration |

---

## 🚀 How to Push Changes to GitHub
Run these commands in your terminal:
1.  `git add .`
2.  `git commit -m "Fix import paths, remove MailerLite, and update DNS guide"`
3.  `git push origin main`

---
© 2024 Affiliate AI Host. All rights reserved.
