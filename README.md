
# Affiliate AI Host - AWS Amplify Deployment Guide

Your application is hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## 🛠️ Required Environment Variables (Secrets)
In your **AWS Amplify Console**, go to **App Settings** -> **Environment Variables**. You **MUST** add these for the site to work:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Your key from Google AI Studio | `AIza...` |
| `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID` | PayPal Sandbox Client ID | `Ac7...` |
| `PAYPAL_SANDBOX_CLIENT_SECRET` | PayPal Sandbox Secret | `EKl...` |
| `PAYPAL_SANDBOX` | Use sandbox for testing | `true` |

*Note: Firebase configuration is already hardcoded in `src/firebase/config.ts` and does not need to be added to AWS.*

## 🚨 Resolving "Backend Connection Failed"
If your live site displays a "Backend Connection Failed" message, follow these steps to whitelist your domain in Google Cloud:

1.  Go to [Google Cloud Console API Credentials](https://console.cloud.google.com/apis/credentials).
2.  Select your project `rent-a-host-a55fd`.
3.  Edit your **"Browser key (auto-created by Firebase)"**.
4.  Scroll down to **"Website restrictions"**.
5.  Add these two entries to the list:
    *   `https://hostproai.com/*`
    *   `https://*.hostproai.com/*`
6.  Click **Save**. It may take up to 5 minutes to take effect.

## 🚀 How to Push Changes
Use these commands in your terminal to update your live site:

1.  **Stage your changes**:
   ```bash
   git add .
   ```
2.  **Commit your changes**:
   ```bash
   git commit -m "Fix build errors and update AWS guide"
   ```
3.  **Push to GitHub**:
   ```bash
   git push origin main
   ```

---
© 2024 Affiliate AI Host. All rights reserved.
