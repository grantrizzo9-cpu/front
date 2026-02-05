
# Affiliate AI Host - AWS Amplify Deployment Guide

Your application is hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## 🚨 CRITICAL: Fix "Backend Connection Failed" / "Client Offline"
If your live site displays a "Backend Connection Failed" or "Client Offline" message, it is because Google's API restrictions are blocking your live domain. **Follow these two steps exactly:**

### 1. Whitelist in Firebase Console
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project: **`rent-a-host-a55fd`**.
3.  Go to **Build** -> **Authentication** -> **Settings** -> **Authorized domains**.
4.  Click **Add domain** and enter: `hostproai.com`.
5.  Click **Add domain** again and enter: `*.hostproai.com`.

### 2. Whitelist in Google Cloud Console
1.  Go to the [Google Cloud Console API Credentials](https://console.cloud.google.com/apis/credentials).
2.  Ensure project **`rent-a-host-a55fd`** is selected in the top dropdown.
3.  Under **"API Keys"**, click the **Edit** icon next to your **"Browser key (auto-created by Firebase)"**.
4.  Scroll down to the **"Website restrictions"** section.
5.  Add these two entries to the list exactly:
    *   `https://hostproai.com/*`
    *   `https://*.hostproai.com/*`
6.  Click **Save**. It may take up to 5 minutes to take effect globally.

---

## 🛠️ Required Environment Variables (Secrets)
In your **AWS Amplify Console**, go to **App Settings** -> **Environment Variables**. You **MUST** add these exactly as shown for the site features to work:

| Variable Name | Value Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Your key from Google AI Studio |
| `PAYPAL_SANDBOX` | Use `true` for testing, `false` for live |
| `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID` | PayPal Client ID (Frontend) |
| `PAYPAL_SANDBOX_CLIENT_ID` | PayPal Client ID (Backend) |
| `PAYPAL_SANDBOX_CLIENT_SECRET` | PayPal Client Secret |
| `OPENSRS_API_KEY` | Your key for OpenSRS domain registration |

*Note: Firebase configuration is already included in your code and does not need to be added to AWS secrets.*

---

## 🚀 How to Push Changes to GitHub
Use these commands in your terminal to update your live site:

1.  **Stage and Commit**:
   ```bash
   git add .
   git commit -m "Fix import paths and domain whitelisting guide"
   ```
2.  **Push to GitHub**:
   ```bash
   git push origin main
   ```

---
© 2024 Affiliate AI Host. All rights reserved.
