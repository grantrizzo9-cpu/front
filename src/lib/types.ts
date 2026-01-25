export type SubscriptionTier = {
  id: string;
  name: string;
  price: number; // daily price
  priceId: string; // for payment gateway
  description: string;
  features: string[];
  isMostPopular?: boolean;
};

export type User = {
  uid: string;
  email: string | null;
  username: string;
  referredBy: string | null;
  isAffiliate: boolean;
  createdAt: Date;
  subscription?: {
    tierId: string;
    status: 'active' | 'inactive' | 'cancelled';
    startDate: Date;
    endDate: Date | null;
  };
  paypalEmail?: string;
};

export type Referral = {
  id: string;
  referredUserId: string;
  referredUserUsername: string;
  planPurchased: string;
  commission: number;
  status: 'paid' | 'unpaid';
  date: Date;
};

export type Payout = {
  id: string;
  amount: number;
  date: Date;
  transactionId: string;
};

export type AdminPayout = {
    affiliateId: string;
    affiliateUsername: string;
    paypalEmail: string;
    unpaidCommissions: number;
    totalUnpaid: number;
}
