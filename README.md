
# Affiliate AI Host - Live on AWS Amplify

Your application is successfully hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## 🛠️ Resolving "Client is Offline" Errors
If your live site displays a "Backend Connection Failed" or "Failed to get document because the client is offline" message, follow these critical steps:

1.  **Whitelist your Domain in Google Cloud**: 
    - Go to [Google Cloud Console API Credentials](https://console.cloud.google.com/apis/credentials).
    - Select your project `rent-a-host-a55fd`.
    - Edit your **"Browser key (auto-created by Firebase)"**.
    - Scroll down to **"Website restrictions"**.
    - Ensure `hostproai.com` and `*.hostproai.com` are added to the allowed referrers list.
    - Click **Save**.
2.  **Verify Environment Variables**: 
    - In your **AWS Amplify Console**, go to **App Settings** -> **Environment Variables**.
    - Ensure you have added:
        * `GEMINI_API_KEY`
        * `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID`
        * `PAYPAL_SANDBOX_CLIENT_SECRET`
        * `PAYPAL_SANDBOX=true` (or false for live)

## 🚀 How to Push Changes
Use these commands in your terminal to update your live site:

1.  **Stage your changes**:
   ```bash
   git add .
   ```
2.  **Commit your changes**:
   ```bash
   git commit -m "Fix build errors and update domain documentation"
   ```
3.  **Push using your Token**:
   `git push https://stiffasamazon71-arch:YOUR_TOKEN@github.com/stiffasamazon71-arch/front.git main`

## 🌍 Multi-Cloud Architecture
- **Hosting**: AWS Amplify (High-speed global edge network)
- **Database/Auth**: Firebase (Real-time synchronization)
- **AI Engine**: Google Genkit + Gemini 2.5 Flash

---
© 2024 Affiliate AI Host. All rights reserved.
