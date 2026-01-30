'use server';

import paypal from '@paypal/checkout-server-sdk';

/**
 * Initializes and returns a PayPal HTTP client.
 * Returns null and logs a warning if credentials are not properly configured,
 * preventing the application from crashing on startup.
 */
function initializeClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId.includes("REPLACE_WITH") || clientSecret.includes("REPLACE_WITH")) {
        console.warn("**************************************************************************************************");
        console.warn("WARNING: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET are not set correctly in your .env file.");
        console.warn("PayPal server actions will fail. Please add your credentials to the .env file.");
        console.warn("**************************************************************************************************");
        return null;
    }

    try {
        const environment = process.env.NODE_ENV === 'production'
          ? new paypal.core.LiveEnvironment(clientId, clientSecret)
          : new paypal.core.SandboxEnvironment(clientId, clientSecret);
        
        return new paypal.core.PayPalHttpClient(environment);
    } catch (error) {
        console.error("Failed to initialize PayPal client. Your credentials may be invalid.", error);
        return null;
    }
}

const client = initializeClient();

export default client;
