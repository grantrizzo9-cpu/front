
# Affiliate AI Host - AWS Amplify Deployment Guide

Your application is hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## 🚨 Fix "Backend Connection Failed" / "Client Offline"
If your live site displays a "Backend Connection Failed" message, follow these steps to whitelist your domain in Google Cloud. This allows your browser to talk to the Firebase database without activation fees:

1.  Go to [Google Cloud Console API Credentials](https://console.cloud.google.com/apis/credentials).
2.  Ensure project `rent-a-host-a55fd` is selected in the top dropdown.
3.  Click the **Edit** icon next to your **"Browser key (auto-created by Firebase)"**.
4.  Scroll down to **"Website restrictions"**.
5.  Add these two entries to the list exactly:
    *   `https://hostproai.com/*`
    *   `https://*.hostproai.com/*`
6.  Click **Save**. It may take up to 5 minutes to take effect.

## 🛠️ Required Environment Variables (Secrets)
In your **AWS Amplify Console**, go to **App Settings** -> **Environment Variables**. You **MUST** add these exactly as shown for the site features to work:

| Variable Name | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Your key from Google AI Studio |
| `PAYPAL_SANDBOX` | Use `true` for testing, `false` for live |
| `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID` | PayPal Client ID (Frontend) |
| `PAYPAL_SANDBOX_CLIENT_ID` | PayPal Client ID (Backend) |
| `PAYPAL_SANDBOX_CLIENT_SECRET` | PayPal Client Secret |
| `OPENSRS_API_KEY` | Your key for OpenSRS domain registration |

*Note: Firebase configuration is already included in your code and does not need to be added to AWS secrets.*

## 🚀 How to Push Changes to GitHub
Use these commands in your terminal to update your live site:

1.  **Stage and Commit**:
   ```bash
   git add .
   git commit -m "Fix Accordion import path and update secrets README"
   ```
2.  **Push to GitHub**:
   ```bash
   git push origin main
   ```

---
© 2024 Affiliate AI Host. All rights reserved.
