
import type { SubscriptionTier, Referral, Payout, AdminPayout } from './types';

// IMPORTANT: For PayPal integration to work, you must create a separate "Plan" in your 
// PayPal Developer Dashboard (Sandbox) for EACH subscription tier listed below. 
// Each plan must have the correct daily price. Once created, copy the unique Plan ID 
// (it starts with "P-...") and paste it into the corresponding `paypalPlanId` field.
export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 4.95,
    // Example: 'P-1234567890ABCDEFG' - Replace with your actual Sandbox Plan ID for the Starter tier.
    paypalPlanId: 'P-11976043Y1636863PNF67FXA', 
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
    // Replace with your actual Sandbox Plan ID for the Plus tier.
    paypalPlanId: 'P-1EG68235K3435163JNF7SDFA',
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
    // Replace with your actual Sandbox Plan ID for the Pro tier.
    paypalPlanId: 'P-5W037679NJ177610XNF7SEFQ',
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
    // Replace with your actual Sandbox Plan ID for the Business tier.
    paypalPlanId: 'P-6JG346243U749934ENF7SFSA',
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
    // Replace with your actual Sandbox Plan ID for the Scale tier.
    paypalPlanId: 'P-9SY225236J3759335NF7SGRQ',
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
    // Replace with your actual Sandbox Plan ID for the Enterprise tier.
    paypalPlanId: 'P-5Y2152619Y596201DNF7SHLI',
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
