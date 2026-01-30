
'use server';

import { subscriptionTiers } from "@/lib/data";

// NOTE: The PayPal order creation and capture logic has been moved to the API route
// at /api/paypal for improved stability and error handling.
// These functions are deprecated and will be removed in a future update.
// If you see errors pointing here, please update your client-side code to call
// the /api/paypal endpoint instead.
