import type { SubscriptionTier, Referral, Payout, AdminPayout } from './types';

// --- IMPORTANT PAYPAL SETUP ---
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
    description: 'Professional tools for serious affiliates.',
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
      '70% Base / 75% Target Commission',
    ],
    isMostPopular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 99.95,
    paypalPlanId_Sandbox: 'P-6JG346243U749934ENF7SFSA',
    paypalPlanId_Live: 'REPLACE_WITH_LIVE_PLAN_ID',
    description: 'Business tools for established agencies.',
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
      '70% Base / 75% Target Commission',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 299.95,
    paypalPlanId_Sandbox: 'P-9SY225236J3759335NF7SGRQ',
    paypalPlanId_Live: 'REPLACE_WITH_LIVE_PLAN_ID',
    description: 'Tools for scaling your operations.',
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
      '70% Base / 75% Target Commission',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499.95,
    paypalPlanId_Sandbox: 'P-5Y2152619Y596201DNF7SHLI',
    paypalPlanId_Live: 'REPLACE_WITH_LIVE_PLAN_ID',
    description: 'Enterprise-grade tools for power-users.',
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
      '70% Base / 75% Target Commission',
    ],
  },
];

export const mockReferrals: Referral[] = [];
export const mockPayouts: Payout[] = [];
export const mockAdminPayouts: AdminPayout[] = [];

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
      '--primary-color': '#38BDF8',
      '--secondary-color': '#A78BFA',
      '--background-color': '#111827',
      '--card-background': '#1F2937',
      '--text-color': '#F9FAFB',
      '--muted-color': '#9CA3AF',
    },
  },
  {
    name: 'Chocolate Caramel',
    colors: {
      '--primary-color': '#78350F',
      '--secondary-color': '#F59E0B',
      '--background-color': '#FEFCE8',
      '--card-background': '#FFFFFF',
      '--text-color': '#1F2937',
      '--muted-color': '#6B7280',
    },
  },
];