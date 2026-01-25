import type { SubscriptionTier, Referral, Payout, AdminPayout } from './types';

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 1.99,
    priceId: 'price_starter_daily',
    description: 'For individuals starting out.',
    features: [
      '1 Website',
      '10 GB SSD Storage',
      'Basic AI Tools',
      '75% Affiliate Commission',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 4.99,
    priceId: 'price_growth_daily',
    description: 'For growing businesses and affiliates.',
    features: [
      '10 Websites',
      '50 GB SSD Storage',
      'Advanced AI Tools',
      'Priority Support',
      '75% Affiliate Commission',
    ],
    isMostPopular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    priceId: 'price_pro_daily',
    description: 'For power users and large teams.',
    features: [
      'Unlimited Websites',
      '200 GB SSD Storage',
      'Pro AI Suite',
      'Dedicated Support',
      '75% Affiliate Commission',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    priceId: 'price_enterprise_daily',
    description: 'For large-scale applications.',
    features: [
      'Custom Infrastructure',
      'Unlimited Storage',
      'Custom AI Models',
      '24/7/365 Support',
      '75% Affiliate Commission',
    ],
  },
];

export const mockReferrals: Referral[] = [
  { id: '1', referredUserId: 'user123', referredUserUsername: 'john_doe', planPurchased: 'Growth', commission: 3.74, status: 'unpaid', date: new Date('2024-07-20T10:00:00Z') },
  { id: '2', referredUserId: 'user456', referredUserUsername: 'jane_smith', planPurchased: 'Starter', commission: 1.49, status: 'unpaid', date: new Date('2024-07-19T14:30:00Z') },
  { id: '3', referredUserId: 'user789', referredUserUsername: 'sam_wilson', planPurchased: 'Pro', commission: 7.49, status: 'paid', date: new Date('2024-07-18T09:00:00Z') },
  { id: '4', referredUserId: 'user101', referredUserUsername: 'alex_chen', planPurchased: 'Growth', commission: 3.74, status: 'paid', date: new Date('2024-07-18T11:00:00Z') },
  { id: '5', referredUserId: 'user112', referredUserUsername: 'maria_garcia', planPurchased: 'Growth', commission: 3.74, status: 'paid', date: new Date('2024-07-17T18:00:00Z') },
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
