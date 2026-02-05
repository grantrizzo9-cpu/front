# Affiliate AI Host - Live on AWS Amplify

Your application is now successfully hosted on **AWS Amplify** and accessible at [hostproai.com](https://hostproai.com).

## 🌍 Multi-Cloud Architecture
- **Hosting**: AWS Amplify (High-speed global edge network)
- **Database/Auth**: Firebase (Real-time synchronization)
- **AI Engine**: Google Genkit + Gemini 2.5 Flash

## 🛠️ Resolving "Client is Offline" Errors
If your live site displays a "Backend Connection Failed" message or "Client is Offline" error, follow these steps:

1.  **Check Firebase Console**: Log in to [Firebase Console](https://console.firebase.google.com/) and ensure your project is not suspended. If you see a "Billing Account Required" or "Suspended" banner, you must resolve it there.
2.  **Verify Environment Variables**: In your **AWS Amplify Console**, go to **App Settings** -> **Environment Variables**. Ensure you have added:
    *   `GEMINI_API_KEY`
    *   `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID`
    *   `PAYPAL_SANDBOX_CLIENT_SECRET`
    *   `PAYPAL_SANDBOX=true`
3.  **Update Config (If Needed)**: If your original Firebase project is permanently restricted, create a brand new one and update the values in `src/firebase/config.ts`.

## 🚀 Pushing Updates
To push new changes to your live site:
1. Make your changes in this workspace.
2. Run in terminal:
   ```bash
   git add .
   git commit -m "Update feature description"
   git push origin main
   ```
AWS Amplify will detect the push and redeploy your site automatically.

---
© 2024 Affiliate AI Host. All rights reserved.