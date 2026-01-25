import type { SubscriptionTier, Referral, Payout, AdminPayout } from './types';

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 4.95,
    priceId: 'price_starter_daily',
    description: 'Launch your affiliate journey with essential tools and incredible value.',
    features: [
      '3 Websites',
      '20 GB NVMe Storage',
      'Free SSL Certificates',
      'Daily Backups',
      'Basic AI Content Tools (Blog posts, social updates)',
      'Standard Support',
      '75% Affiliate Commission',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 19.95,
    priceId: 'price_plus_daily',
    description: 'All Starter features, plus more power for growing affiliates.',
    features: [
      '10 Websites',
      '50 GB NVMe Storage',
      'Global CDN for faster loading speeds',
      'Standard AI Suite (adds basic image generation)',
      'Standard Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49.95,
    priceId: 'price_pro_daily',
    description: 'All Plus features, plus pro tools for serious affiliates scaling up.',
    features: [
      '25 Websites',
      '100 GB NVMe Storage',
      '1-Click Staging Environment',
      'Advanced AI Suite (adds logos & marketing copy)',
      'Priority Support',
    ],
    isMostPopular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 99.95,
    priceId: 'price_business_daily',
    description: 'All Pro features, plus business tools for established affiliates and agencies.',
    features: [
      '75 Websites',
      '250 GB NVMe Storage',
      'Dedicated IP Address',
      'Pro AI Suite (adds AI analytics & advanced image editing)',
      'Priority Support',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 299.95,
    priceId: 'price_scale_daily',
    description: 'All Business features, plus tools for scaling your operations.',
    features: [
      '150 Websites',
      '500 GB NVMe Storage',
      'Business AI Suite (adds workflow automation & predictive analytics)',
      'Dedicated Support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499.95,
    priceId: 'price_enterprise_daily',
    description: 'All Scale features, plus enterprise-grade tools for power-users.',
    features: [
      'Unlimited Websites',
      '1 TB NVMe Storage',
      'Enterprise AI Suite (adds API access & custom models)',
      'Dedicated Account Manager',
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
