
# Affiliate AI Host - Live on AWS Amplify

Your application is successfully hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## 🌍 Multi-Cloud Architecture
- **Hosting**: AWS Amplify (High-speed global edge network)
- **Database/Auth**: Firebase (Real-time synchronization)
- **AI Engine**: Google Genkit + Gemini 2.5 Flash

## 🛠️ Resolving "Client is Offline" Errors
If your live site displays a "Backend Connection Failed" message or "Client is Offline" error, follow these critical steps:

1.  **Check API Restrictions**: 
    - Go to [Google Cloud Console API Credentials](https://console.cloud.google.com/apis/credentials).
    - Select your project `rent-a-host-a55fd`.
    - Edit your "Browser key (auto-created by Firebase)".
    - Under **Website restrictions**, ensure `hostproai.com` and `*.hostproai.com` are added to the allowed referrers.
2.  **Verify Environment Variables**: 
    - In your **AWS Amplify Console**, go to **App Settings** -> **Environment Variables**.
    - Ensure you have added:
        * `GEMINI_API_KEY`
        * `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID`
        * `PAYPAL_SANDBOX_CLIENT_SECRET`
        * `PAYPAL_SANDBOX=true` (or false for live)

## 🚀 Pushing Updates
To push new changes to your live site:
1. Run in terminal:
   ```bash
   git add .
   git commit -m "Apply latest fixes"
   git push origin main
   ```
AWS Amplify will detect the push and redeploy your site automatically.

---
© 2024 Affiliate AI Host. All rights reserved.
