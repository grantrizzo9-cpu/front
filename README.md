
# Affiliate AI Host - Live on AWS Amplify

Your application is successfully hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## 🚀 How to Push Changes
When you want to update your live site, follow these steps in your terminal:

1. **Stage your changes**:
   ```bash
   git add .
   ```
2. **Commit your changes**:
   ```bash
   git commit -m "Fix build errors and update configuration"
   ```
3. **Push using your Token**:
   Use the command below (replace `YOUR_TOKEN` with your actual GitHub token if the terminal asks for it):
   ```bash
   git push origin main
   ```
   *Note: If you get an authentication error, use the URL format:*
   `git push https://stiffasamazon71-arch:YOUR_TOKEN@github.com/stiffasamazon71-arch/front.git main`

## 🛠️ Resolving "Client is Offline" Errors
If your live site displays a "Backend Connection Failed" message, follow these critical steps:

1.  **Whitelist your Domain in Google Cloud**: 
    - Go to [Google Cloud Console API Credentials](https://console.cloud.google.com/apis/credentials).
    - Select your project `rent-a-host-a55fd`.
    - Edit your **"Browser key (auto-created by Firebase)"**.
    - Under **Website restrictions**, ensure `hostproai.com` and `*.hostproai.com` are added to the allowed referrers.
2.  **Verify Environment Variables**: 
    - In your **AWS Amplify Console**, go to **App Settings** -> **Environment Variables**.
    - Ensure you have added:
        * `GEMINI_API_KEY`
        * `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID`
        * `PAYPAL_SANDBOX_CLIENT_SECRET`
        * `PAYPAL_SANDBOX=true` (or false for live)

## 🌍 Multi-Cloud Architecture
- **Hosting**: AWS Amplify (High-speed global edge network)
- **Database/Auth**: Firebase (Real-time synchronization)
- **AI Engine**: Google Genkit + Gemini 2.5 Flash

---
© 2024 Affiliate AI Host. All rights reserved.
