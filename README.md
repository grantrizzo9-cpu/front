# Affiliate AI Host

An AI-powered web hosting and affiliate marketing platform built with Next.js, Firebase, and Genkit.

## Features

- **Daily PayPal Payouts**: Automated commission system for recurring sales.
- **AI Content Generator**: Built-in tools for blog posts, email copy, and social media.
- **AI Image & Video Generation**: Create professional marketing assets using Gemini and Imagen.
- **One-Click Website Builder**: Instantly generate and preview affiliate landing pages.
- **Custom Domain Hosting**: Seamless integration for users to connect their own brands.
- **Tiered Marketing Guides**: Unlockable expert strategies based on subscription level.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: ShadCN UI + Tailwind CSS
- **Icons**: Lucide React
- **Database & Auth**: Firebase (Firestore & Authentication)
- **AI Orchestration**: Google Genkit
- **Payments**: PayPal SDK Integration

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/grantrizzo9-cpu/front.git
   cd front
   ```

2. **Setup Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   
   # PayPal Sandbox
   NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_sandbox_secret
   
   # Set to "false" when moving to production
   PAYPAL_SANDBOX=true 
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Firebase Configuration

This app is linked to the project: **rent-a-host-a55fd**. Ensure your `src/firebase/config.ts` matches your Firebase project settings from the console.

## License

Private / All Rights Reserved
