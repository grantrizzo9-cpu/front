
import type { Timestamp } from 'firebase/firestore';

export type SubscriptionTier = {
  id: string;
  name: string;
  price: number; // daily price
  paypalPlanId_Sandbox: string;
  paypalPlanId_Live: string;
  description: string;
  features: string[];
  isMostPopular?: boolean;
  guideAccessLevel: 'starter' | 'plus' | 'pro' | 'business' | 'scale' | 'enterprise';
};

export type User = {
  id: string; // This should be uid from auth
  uid: string;
  email: string | null;
  username: string;
  referredBy: string | null; // This will now store the Referrer's UID
  isAffiliate: boolean;
  createdAt: Timestamp;
  subscription?: {
    tierId: string;
    status: 'active' | 'inactive' | 'cancelled';
    startDate: Timestamp;
    endDate: Timestamp | null;
    trialEndDate?: Timestamp | null;
    paypalSubscriptionId?: string; // To manage the subscription in PayPal
  };
  paypalEmail?: string;
  customDomain?: {
    name: string;
    status: 'unconfigured' | 'pending' | 'connected' | 'error';
  } | null;
};

export type Referral = {
  id: string;
  affiliateId: string;
  referredUserId: string;
  referredUserUsername: string;
  referredUserEmail: string;
  planPurchased: string;
  grossSale: number;
  commission: number;
  status: 'paid' | 'unpaid'; // For future recurring commission payments
  activationStatus: 'pending' | 'activated'; // For the initial admin fee
  date: Timestamp;
  subscriptionId: string;
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
    affiliateEmail: string;
    paypalEmail: string;
    unpaidCommissions: number;
    totalUnpaid: number;
}

export type RefundRequest = {
  id: string;
  userId: string;
  userEmail: string;
  userUsername: string;
  reason: string;
  amount: number;
  status: 'pending' | 'processed' | 'denied';
  requestedAt: Timestamp;
};

export type Content = {
  id: string;
  userId: string;
  title: string;
  topic: string;
  contentType: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Website = {
  id: string;
  userId: string;
  themeName: string;
  content: any; // This holds the output of the website generator flow
  status: 'draft' | 'published';
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
