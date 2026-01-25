# **App Name**: Affiliate AI Host

## Core Features:

- Affiliate Referral Tracking: Tracks referrals via unique affiliate links, permanently linking new users to the referring affiliate in Firestore.
- Subscription Plan Management: Handles multiple tiers of subscription plans with varying web hosting resources and AI tool access, displaying them on a public pricing page.
- Automated PayPal Checkout: Integrates a fully automated PayPal checkout for new users and upgrades, triggering instant account activation upon successful payment confirmation and updating relevant Firestore records.
- Automated Commission Logging: Automatically calculates and logs affiliate commissions (75% per sale) as 'unpaid' in Firestore upon successful payment.
- Affiliate Dashboard: Provides affiliates with a secure dashboard displaying key metrics, referral tables, payout history, and a settings page to manage their affiliate link and account details.  Payout details pulled from the payments subcollection under the current user.
- Admin Panel: Grants administrators access to a restricted panel for managing and processing daily affiliate payouts, allowing them to send payments and mark commissions as 'paid' in Firestore, generating payment records for affiliates.
- Refund Request Automation: Manages the refund process by allowing users to request a refund within 24 hours if they have less than 2 referrals and triggering automated tasks.

## Style Guidelines:

- Primary color: A vibrant blue (#29ABE2) evoking trust and technology.
- Background color: Light gray (#F0F2F5), a desaturated blue, for a clean, modern feel.
- Accent color: A contrasting yellow-orange (#F2994A) for call-to-action buttons and important highlights.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text. 'Space Grotesk' offers a computerized, techy feel, while 'Inter' provides a modern, neutral look for readability.
- Use modern, flat-style icons to represent different features and subscription tiers.
- Emphasize a clear, intuitive layout with well-defined sections for the affiliate dashboard and admin panel.
- Incorporate subtle animations for loading states and user interactions to enhance engagement.