
import type { Timestamp } from 'firebase/firestore';

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
  createdAt: Timestamp;
  subscription?: {
    tierId: string;
    status: 'active' | 'inactive' | 'cancelled';
    startDate: Timestamp;
    endDate: Timestamp | null;
  };
  paypalEmail?: string;
};

export type Referral = {
  id: string;
  affiliateId: string;
  referredUserId: string;
  referredUserUsername: string;
  planPurchased: string;
  commission: number;
  status: 'paid' | 'unpaid';
  date: Timestamp;
  subscriptionId: string;
  // This property is added for security rule validation during creation.
  triggeringUserReferredBy?: string;
};

export type Payout = {
  id: string;
  amount: number;
  date: Timestamp;
  transactionId?: string;
};

export type AdminPayout = {
    affiliateId: string;
    affiliateUsername: string;
    paypalEmail: string;
    unpaidCommissions: number;
    totalUnpaid: number;
}

export type RefundRequest = {
  id: string;
  userId: string;
  userUsername: string;
  userEmail: string | null;
  requestDate: Timestamp;
  status: 'pending' | 'processed' | 'denied';
  referralCountAtRequest: number;
};
