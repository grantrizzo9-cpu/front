
import type { SubscriptionTier, Referral, Payout, AdminPayout } from './types';

// --- IMPORTANT PAYPAL SETUP ---
//
// To process payments, you must create subscription "Products" and "Plans" in your PayPal Developer Dashboard
// for EACH of the subscription tiers listed below. This must be done for BOTH your Sandbox and Live environments.
//
// 1. Create a Product: In your PayPal Dashboard, go to "Subscriptions" -> "Subscription products" and create a product.
//    Name: Affiliate AI Host
//    Type: Service
//
// 2. Create Plans for the Product: For the product you just created, create a new plan for EACH tier below.
//    - The Plan Name should match the tier name (e.g., "Starter").
//    - The Billing Cycle should be set to "Every 1 Day".
//    - The Price must match the price for the tier exactly.
//
// 3. Copy the Plan IDs: Once a plan is created, PayPal gives it a unique ID (starts with "P-...").
//    - Copy the ID for your SANDBOX plan and paste it into the `paypalPlanId_Sandbox` field for that tier.
//    - Copy the ID for your LIVE plan and paste it into the `paypalPlanId_Live` field for that tier.
//
// The current values are placeholder SANDBOX IDs and will not work.
export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 4.95,
    paypalPlanId_Sandbox: 'P-11976043Y1636863PNF67FXA', 
    paypalPlanId_Live: 'REPLACE_WITH_LIVE_PLAN_ID',
    description: 'Launch your affiliate journey with these essential tools.',
    guideAccessLevel: 'starter',
    features: [
      '3 Websites',
      '20 GB NVMe Storage',
      'Free SSL Certificates',
      'Daily Backups',
      'Basic AI Content Tools',
      'Access to Starter Marketing Guides',
      'Standard Support',
      '70% Affiliate Commission',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 19.95,
    paypalPlanId_Sandbox: 'P-1EG68235K3435163JNF7SDFA',
    paypalPlanId_Live: 'REPLACE_WITH_LIVE_PLAN_ID',
    description: 'Everything in Starter, plus more power and speed.',
    guideAccessLevel: 'plus',
    features: [
      '10 Websites',
      '50 GB NVMe Storage',
      'Global CDN for faster loading speeds',
      'Free SSL Certificates',
      'Daily Backups',
      'Standard AI Suite',
      'Access to Plus Marketing Guides',
      'Standard Support',
      '70% Affiliate Commission',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49.95,
    paypalPlanId_Sandbox: 'P-5W037679NJ177610XNF7SEFQ',
    paypalPlanId_Live: 'REPLACE_WITH_LIVE_PLAN_ID',
    description: 'Everything in Pro, with professional tools for serious affiliates.',
    guideAccessLevel: 'pro',
    features: [
      '25 Websites',
      '100 GB NVMe Storage',
      '1-Click Staging Environment',
      'Global CDN for faster loading speeds',
      'Free SSL Certificates',
      'Daily Backups',
      'Advanced AI Suite',
      'Access to Pro Marketing Guides',
      'Priority Support',
      '70% Affiliate Commission (75% after 10 referrals)',
    ],
    isMostPopular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 99.95,
    paypalPlanId_Sandbox: 'P-6JG346243U749934ENF7SFSA',
    paypalPlanId_Live: 'REPLACE_WITH_LIVE_PLAN_ID',
    description: 'Everything in Pro, with business tools for established agencies.',
    guideAccessLevel: 'business',
    features: [
      '75 Websites',
      '250 GB NVMe Storage',
      'Dedicated IP Address',
      '1-Click Staging Environment',
      'Global CDN for faster loading speeds',
      'Free SSL Certificates',
      'Daily Backups',
      'Pro AI Suite',
      'Access to Business Marketing Guides',
      'Priority Support',
      '70% Affiliate Commission (75% after 10 referrals)',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 299.95,
    paypalPlanId_Sandbox: 'P-9SY225236J3759335NF7SGRQ',
    paypalPlanId_Live: 'REPLACE_WITH_LIVE_PLAN_ID',
    description: 'Everything in Scale, plus tools for scaling your operations.',
    guideAccessLevel: 'scale',
    features: [
      '150 Websites',
      '500 GB NVMe Storage',
      'Dedicated IP Address',
      '1-Click Staging Environment',
      'Global CDN for faster loading speeds',
      'Free SSL Certificates',
      'Daily Backups',
      'Business AI Suite',
      'Access to Scale-Level Marketing Guides',
      'Dedicated Support',
      '70% Affiliate Commission (75% after 10 referrals)',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499.95,
    paypalPlanId_Sandbox: 'P-5Y2152619Y596201DNF7SHLI',
    paypalPlanId_Live: 'REPLACE_WITH_LIVE_PLAN_ID',
    description: 'Everything in Scale, plus enterprise-grade tools for power-users.',
    guideAccessLevel: 'enterprise',
    features: [
      'Unlimited Websites',
      '1 TB NVMe Storage',
      'Dedicated IP Address',
      '1-Click Staging Environment',
      'Global CDN for faster loading speeds',
      'Free SSL Certificates',
      'Daily Backups',
      'Enterprise AI Suite',
      'Access to Enterprise Marketing Guides',
      'Dedicated Account Manager',
      '70% Affiliate Commission (75% after 10 referrals)',
    ],
  },
];

export const mockReferrals: Referral[] = [
  { id: '1', referredUserId: 'user123', referredUserUsername: 'john_doe', planPurchased: 'Gold', commission: 149.96, status: 'unpaid', date: new Date('2024-07-20T10:00:00Z') },
  { id: '2', referredUserId: 'user456', referredUserUsername: 'jane_smith', planPurchased: 'Silver', commission: 74.96, status: 'unpaid', date: new Date('2024-07-19T14:30:00Z') },
  { id: '3', referredUserId: 'user789', referredUserUsername: 'sam_wilson', planPurchased: 'Platinum', commission: 224.96, status: 'paid', date: new Date('2024-07-18T09:00:00Z') },
  { id: '4', referredUserId: 'user101', referredUserUsername: 'alex_chen', planPurchased: 'Silver', commission: 74.96, status: 'paid', date: new Date('2024-07-18T11:00:00Z') },
  { id: '5', referredUserId: 'user112', referredUserUsername: 'maria_garcia', planPurchased: 'Gold', commission: 149.96, status: 'paid', date: new Date('2024-07-17T18:00:00Z') },
];

export const mockPayouts: Payout[] = [
    { id: 'payout1', amount: 150.75, date: new Date('2024-07-19T08:00:00Z'), transactionId: 'PAYPAL_TXN_1ABC' },
    { id: 'payout2', amount: 125.50, date: new Date('2024-07-18T08:00:00Z'), transactionId: 'PAYPAL_TXN_2DEF' },
    { id: 'payout3', amount: 180.20, date: new Date('2024-07-17T08:00:00Z'), transactionId: 'PAYPAL_TXN_3GHI' },
];

export const mockAdminPayouts: AdminPayout[] = [
    { affiliateId: 'affiliate1', affiliateUsername: 'top_seller', unpaidCommissions: 15, totalUnpaid: 56.10, paypalEmail: 'topseller@example.com' },
    { affiliateId: 'affiliate2', affiliateUsername: 'market_guru', unpaidCommissions: 8, totalUnpaid: 29.92, paypalEmail: 'marketguru@example.com' },
    { affiliateId: 'affiliate3', affiliateUsername: 'affiliate_pro', unpaidCommissions: 22, totalUnpaid: 82.28, paypalEmail: 'pro@example.com' },
];


export type WebsiteTheme = {
  name: string;
  colors: {
    '--primary-color': string;
    '--secondary-color': string;
    '--background-color': string;
    '--card-background': string;
    '--text-color': string;
    '--muted-color': string;
  };
};

export const websiteThemes: WebsiteTheme[] = [
  {
    name: 'Vibrant Violet',
    colors: {
      '--primary-color': '#8B5CF6',
      '--secondary-color': '#EC4899',
      '--background-color': '#F5F3FF',
      '--card-background': '#FFFFFF',
      '--text-color': '#1F2937',
      '--muted-color': '#6B7280',
    },
  },
  {
    name: 'Crimson Tide',
    colors: {
      '--primary-color': '#DC2626',
      '--secondary-color': '#F472B6',
      '--background-color': '#FEF2F2',
      '--card-background': '#FFFFFF',
      '--text-color': '#1F2937',
      '--muted-color': '#6B7280',
    },
  },
  {
    name: 'Forest Green',
    colors: {
      '--primary-color': '#16A34A',
      '--secondary-color': '#84CC16',
      '--background-color': '#F0FDF4',
      '--card-background': '#FFFFFF',
      '--text-color': '#1F2937',
      '--muted-color': '#6B7280',
    },
  },
  {
    name: 'Ocean Blue',
    colors: {
      '--primary-color': '#2563EB',
      '--secondary-color': '#22D3EE',
      '--background-color': '#EFF6FF',
      '--card-background': '#FFFFFF',
      '--text-color': '#1F2937',
      '--muted-color': '#6B7280',
    },
  },
  {
    name: 'Sunset Orange',
    colors: {
      '--primary-color': '#F97316',
      '--secondary-color': '#FACC15',
      '--background-color': '#FFF7ED',
      '--card-background': '#FFFFFF',
      '--text-color': '#1F2937',
      '--muted-color': '#6B7280',
    },
  },
  {
    name: 'Midnight Glow',
    colors: {
      '--primary-color': '#38BDF8', // Electric Blue
      '--secondary-color': '#A78BFA', // Lighter Purple
      '--background-color': '#111827', // Almost Black
      '--card-background': '#1F2937', // Dark Gray
      '--text-color': '#F9FAFB', // Light Gray
      '--muted-color': '#9CA3AF', // Muted Gray
    },
  },
  {
    name: 'Chocolate Caramel',
    colors: {
      '--primary-color': '#78350F', // Brown
      '--secondary-color': '#F59E0B', // Amber/Caramel
      '--background-color': '#FEFCE8', // Light yellow/beige
      '--card-background': '#FFFFFF',
      '--text-color': '#1F2937',
      '--muted-color': '#6B7280',
    },
  },
];
