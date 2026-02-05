# Affiliate AI Host - Multi-Cloud Ready (AWS + Firebase)

This is a professional Next.js application designed for a **Multi-Cloud** architecture. It leverages **AWS Amplify** for global high-speed hosting and **Firebase** for its real-time database and authentication.

## 🚀 Deployment to AWS Amplify

To host your website on Amazon instead of Firebase (the best way to bypass billing restrictions), follow these steps:

1.  **Push to GitHub**: Ensure your code is clean of secrets (see Troubleshooting below).
2.  **AWS Amplify Console**: Log in to the AWS Management Console, search for **AWS Amplify**, and click "Create new app" -> "GitHub".
3.  **Authorize**: Authorize AWS to access your GitHub and select your repository and `main` branch.
4.  **Environment Variables**: Under "App Settings" -> "Environment Variables", you **MUST** add these keys:
    *   `GEMINI_API_KEY`
    *   `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID`
    *   `PAYPAL_SANDBOX_CLIENT_SECRET`
    *   `PAYPAL_SANDBOX=true`
5.  **Build and Deploy**: AWS will build your site and provide a live URL instantly.

## 🛠️ Troubleshooting Git Push (Blocked Push)

If GitHub blocks your push because of a "secret token" error, run these commands in your terminal to wipe the history and start fresh:

1. **Reset History**:
   ```bash
   git reset --soft origin/main
   ```
2. **Commit Cleanly**:
   ```bash
   git add .
   git commit -m "Final clean build for AWS Amplify"
   ```
3. **Push to GitHub**:
   ```bash
   git push -f origin main
   ```

---
© 2024 Affiliate AI Host. All rights reserved.
