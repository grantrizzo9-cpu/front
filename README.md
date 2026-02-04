# Affiliate AI Host - AWS Amplify Ready

This is a Next.js application designed for a "Multi-Cloud" architecture. It uses **AWS Amplify** for global high-speed hosting and **Firebase** for its real-time database and authentication.

## 🚀 Deployment to AWS Amplify

If you want to host your website on Amazon instead of Firebase, follow these steps:

1. **GitHub Push**: Push your current code to a private GitHub repository.
2. **AWS Amplify**: Log in to the AWS Console, search for **Amplify**, and click "Create new app" -> "GitHub".
3. **Repository Linking**: Authorize AWS to access your GitHub and select the `front` repository and `main` branch.
4. **Build Settings**: Amplify will automatically detect Next.js.
5. **Environment Variables**: Under "App Settings" -> "Environment Variables", you **MUST** add these keys from your `.env` file:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID`
   - `PAYPAL_SANDBOX_CLIENT_SECRET`
   - `PAYPAL_SANDBOX=true`
6. **Save and Deploy**: AWS will build your site and provide a live URL.

## ⚙️ How it works (Multi-Cloud)
- **Frontend**: Hosted on AWS Amplify (Global CDN).
- **Database**: Firestore (Firebase) - Linked via `src/firebase/config.ts`.
- **Authentication**: Firebase Auth - Linked via `src/firebase/config.ts`.

This allows you to bypass Firebase Hosting restrictions while still using their powerful database backend.

## 🛠 Local Development

```bash
npm install
npm run dev
```

---
© 2024 Affiliate AI Host. All rights reserved.