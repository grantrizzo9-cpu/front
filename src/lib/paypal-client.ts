'use server';

import paypal from '@paypal/checkout-server-sdk';

// This is the important change: The client is not created here.
let client: paypal.core.PayPalHttpClient | null = null;

/**
 * Initializes and returns a PayPal HTTP client ON DEMAND.
 * Caches the client to avoid re-creating it on every call within a single server instance's lifetime.
 * Returns null and logs a warning if credentials are not properly configured.
 */
export async function getClient(): Promise<paypal.core.PayPalHttpClient | null> {
    // Return the cached client if it exists
    if (client) {
        return client;
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId.includes("REPLACE_WITH") || clientSecret.includes("REPLACE_WITH")) {
        console.warn("**************************************************************************************************");
        console.warn("WARNING: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET are not set correctly in your .env file.");
        console.warn("PayPal server actions will fail. Please add your credentials to the .env file.");
        console.warn("**************************************************************************************************");
        return null; // Return null instead of crashing
    }

    try {
        const environment = process.env.NODE_ENV === 'production'
          ? new paypal.core.LiveEnvironment(clientId, clientSecret)
          : new paypal.core.SandboxEnvironment(clientId, clientSecret);
        
        // Create and cache the client
        client = new paypal.core.PayPalHttpClient(environment);
        return client;
    } catch (error) {
        console.error("Failed to initialize PayPal client. Your credentials may be invalid.", error);
        return null; // Return null on error
    }
}
