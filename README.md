# Affiliate AI Host

An AI-powered web hosting and affiliate marketing platform built with Next.js, Firebase, and Genkit.

## 🚀 Features

- **Daily PayPal Payouts**: Automated commission system for recurring sales.
- **AI Content Generator**: Built-in tools for blog posts, email copy, and social media.
- **One-Click Website Builder**: Instantly generate and preview affiliate landing pages.
- **Multi-Cloud Ready**: Can be hosted on Firebase, Vercel, or AWS Amplify.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database & Auth**: Firebase (Firestore & Authentication)
- **AI Orchestration**: Google Genkit (Gemini & Imagen)
- **Payments**: PayPal SDK Integration

## 📦 Setup & Deployment

### 1. Environment Variables
Create a `.env` file in the root and add your keys:
```env
GEMINI_API_KEY=your_key
NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID=your_id
PAYPAL_SANDBOX_CLIENT_SECRET=your_secret
PAYPAL_SANDBOX=true
```

### 2. Local Development
```bash
npm install
npm run dev
```

### 3. Deployment to AWS Amplify
1. Push this code to a **GitHub** repository.
2. In the AWS Console, search for **Amplify**.
3. Connect your GitHub repo and select the `main` branch.
4. Add your `.env` variables in the Amplify Console under **App Settings > Environment Variables**.
5. Deploy! Amplify will automatically build and host your Next.js app.

## 🛡 Security
This project uses a `.gitignore` file to ensure sensitive keys are never pushed to public repositories. Ensure your `.env` file is never committed.

---
© 2024 Affiliate AI Host. All rights reserved.