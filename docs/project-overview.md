# Affiliate AI Host - Project Overview & Technical Guide

## 🚀 Platform Summary
Affiliate AI Host is a specialized SaaS platform designed for affiliate marketers. It combines high-performance web hosting with a suite of integrated AI tools and a lucrative daily-payout affiliate program.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
- **UI Components**: ShadCN UI (Radix Primitives), Lucide Icons.
- **Backend**: Firebase (Authentication, Firestore Database).
- **AI Engine**: Genkit 1.x using Google Gemini 2.5 Flash, Imagen 4, and Veo 2.0.
- **Payments**: PayPal Billing Subscriptions API.
- **Deployment**: Render (Primary), optimized for Cloudflare Pages/AWS Amplify.

## 📊 Database Schema (Firestore)
- `/users/{userId}`: Core user profiles and subscription status.
- `/users/{userId}/referrals/{refId}`: Tracking for affiliate referrals and commissions.
- `/users/{userId}/payments/{payId}`: History of PayPal payouts.
- `/users/{userId}/websites/{webId}`: AI-generated website configurations.
- `/users/{userId}/refundRequests/{reqId}`: User-submitted refund tickets.
- `/usernames/{username}`: A public map of usernames to UIDs for referral routing.
- `/roles_admin/{userId}`: A "tag" collection that grants admin privileges.

## 🔒 Security Configuration
The platform uses **Path-Based Ownership**. Users can only read/write data under their own UID path.
- **Platform Owners**: Hardcoded in `use-admin.ts` and `firestore.rules` for zero-latency bypass.
- **Admins**: Can manage all domains, refunds, and user roles.

## ⚙️ Required Environment Variables
To clone this setup to a new account, you must configure:
1. **Firebase Config**: API Keys, Project IDs, etc.
2. **Gemini API Key**: From Google AI Studio.
3. **PayPal Credentials**: Sandbox and Live Client IDs/Secrets.

## 🛠️ Key Logic Components
- **Affiliate Link**: `https://hostproai.com/?ref=USERNAME`.
- **Commission Logic**: 70% recurring base, scaling to 75% after 10 active referrals.
- **Website Generator**: A Genkit flow that generates a full landing page (HTML/CSS) based on an affiliate's profile.
