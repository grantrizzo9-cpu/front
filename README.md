# Affiliate AI Host - Multi-Cloud Ready (AWS + Firebase)

This is a professional Next.js application designed for a **Multi-Cloud** architecture. It leverages **AWS Amplify** for global high-speed hosting and **Firebase** for its real-time database and authentication.

## 🚀 Deployment to AWS Amplify

To host your website on Amazon instead of Firebase, follow these steps:

1.  **Push to GitHub**: Ensure your latest code is pushed to your private repository at `https://github.com/grantrizzo9-cpu/front`.
2.  **AWS Amplify Console**: Log in to the AWS Management Console, search for **AWS Amplify**, and click "Create new app" -> "GitHub".
3.  **Authorize**: Authorize AWS to access your GitHub and select the `front` repository and `main` branch.
4.  **Environment Variables**: Under "App Settings" -> "Environment Variables", you **MUST** add these keys from your local `.env` file:
    *   `GEMINI_API_KEY`
    *   `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID`
    *   `PAYPAL_SANDBOX_CLIENT_SECRET`
    *   `PAYPAL_SANDBOX=true`
5.  **Build and Deploy**: AWS will automatically build your site and provide a live URL.

## ⚙️ How it works (Multi-Cloud)
*   **Frontend**: Hosted on AWS Amplify (Global CDN).
*   **Database**: Firestore (Firebase) - Linked via `src/firebase/config.ts`.
*   **Authentication**: Firebase Auth - Linked via `src/firebase/config.ts`.

This allows you to bypass Firebase Hosting billing restrictions while still using their powerful database backend.

## 🛠 Local Development

```bash
npm install
npm run dev
```

---
© 2024 Affiliate AI Host. All rights reserved.