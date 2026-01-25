import type { SubscriptionTier, Referral, Payout, AdminPayout } from './types';

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    price: 49.95,
    priceId: 'price_bronze_daily',
    description: 'For serious affiliates getting started.',
    features: [
      '25 Websites',
      '100 GB NVMe Storage',
      'Advanced AI Tools',
      '75% Affiliate Commission',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 99.95,
    priceId: 'price_silver_daily',
    description: 'For affiliates scaling their business.',
    features: [
      '100 Websites',
      '250 GB NVMe Storage',
      'Pro AI Suite',
      'Priority Support',
      '75% Affiliate Commission',
    ],
    isMostPopular: true,
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 199.95,
    priceId: 'price_gold_daily',
    description: 'For high-earning individuals and teams.',
    features: [
      'Unlimited Websites',
      '500 GB NVMe Storage',
      'Pro AI Suite',
      'Dedicated Support',
      '75% Affiliate Commission',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 299.95,
    priceId: 'price_platinum_daily',
    description: 'For power-affiliates and agencies.',
    features: [
      'Unlimited Websites',
      '1 TB NVMe Storage',
      'Enterprise AI Suite',
      'Dedicated Account Manager',
      '75% Affiliate Commission',
    ],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    price: 399.95,
    priceId: 'price_diamond_daily',
    description: 'For elite marketers managing large portfolios.',
    features: [
      'Custom Infrastructure',
      '2 TB NVMe Storage',
      'Custom AI Models',
      '24/7/365 Support',
      '75% Affiliate Commission',
    ],
  },
  {
    id: 'whale',
    name: 'Whale',
    price: 499.95,
    priceId: 'price_whale_daily',
    description: 'The ultimate package for industry leaders.',
    features: [
      'Fully Managed Infrastructure',
      '5 TB NVMe Storage',
      'Bespoke AI Development',
      'Dedicated Engineering Team',
      '75% Affiliate Commission',
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
