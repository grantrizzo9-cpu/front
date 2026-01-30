'use server';

import paypal from '@paypal/checkout-server-sdk';

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret || clientId.includes("REPLACE_WITH") || clientSecret.includes("REPLACE_WITH")) {
    console.warn("**************************************************************************************************");
    console.warn("WARNING: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET are not set correctly in your .env file.");
    console.warn("PayPal payments will fail. Please add your Live or Sandbox credentials to the .env file.");
    console.warn("**************************************************************************************************");
}

// This checks the environment variable to determine whether to use the live or sandbox environment.
const environment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(clientId!, clientSecret!)
  : new paypal.core.SandboxEnvironment(clientId!, clientSecret!);

const client = new paypal.core.PayPalHttpClient(environment);

export default client;
