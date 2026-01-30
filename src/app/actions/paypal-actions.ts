'use server';

import { subscriptionTiers } from "@/lib/data";

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

/**
 * Gets a PayPal access token by making a direct fetch call.
 * This is a more transparent alternative to the SDK.
 */
async function getPayPalAccessToken(): Promise<{ token?: string; error?: string; debug?: any }> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes('REPLACE_WITH') || clientSecret.includes('REPLACE_WITH')) {
    const errorMsg = "PayPal server credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not configured correctly in the .env file.";
    console.error(errorMsg);
    return { error: errorMsg };
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        // Adding a timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) 
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("PAYPAL_TOKEN_ERROR:", data);
        return { error: `Failed to get PayPal access token. Status: ${response.status}.`, debug: data };
    }

    return { token: data.access_token };
  } catch (e: any) {
    console.error("GET_PAYPAL_ACCESS_TOKEN_CATCH_BLOCK:", e);
    return { error: `An unexpected network error occurred while getting the PayPal token: ${e.message}`, debug: e };
  }
}


/**
 * Creates a PayPal order for a one-time payment for the selected subscription plan.
 * This function is designed to be crash-proof and always return a JSON response.
 * @param planId The ID of the subscription tier to purchase.
 * @returns An object containing the orderId or an error and debug info.
 */
export async function createPaypalOrder(planId: string): Promise<{orderId?: string; error?: string; debug?: any}> {
    try {
        const tokenResult = await getPayPalAccessToken();
        if (tokenResult.error || !tokenResult.token) {
            return { error: "Could not authenticate with PayPal.", debug: tokenResult.error };
        }
        const accessToken = tokenResult.token;

        const plan = subscriptionTiers.find(p => p.id === planId);
        if (!plan) {
            return { error: 'The selected plan could not be found on the server.' };
        }

        const payload = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: plan.price.toFixed(2),
                },
                description: `First day payment for ${plan.name} Plan at Affiliate AI Host`,
            }],
            application_context: {
                brand_name: 'Affiliate AI Host',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                return_url: 'https://example.com/return', // Placeholder required by PayPal
                cancel_url: 'https://example.com/cancel', // Placeholder required by PayPal
            }
        };

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                 // Helps prevent certain classes of errors
                "PayPal-Request-Id": `order-${Math.random().toString(36).substring(7)}`,
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10000)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("PAYPAL_CREATE_ORDER_ERROR:", JSON.stringify(data, null, 2));
            const issue = data.details?.[0]?.issue || data.name || "UNKNOWN_ISSUE";
            const description = data.details?.[0]?.description || data.message || "An error occurred while creating the order.";
            return { error: `PayPal Error: ${issue}`, debug: description };
        }

        if (!data.id) {
            console.error("PAYPAL_CREATE_ORDER_NO_ID:", data);
            return { error: "PayPal did not return an order ID.", debug: data };
        }

        return { orderId: data.id };

    } catch (e: any) {
        console.error("CRITICAL_ERROR_IN_CREATE_PAYPAL_ORDER_ACTION:", e);
        return {
            error: "A critical server error occurred while creating the PayPal order.",
            debug: e.message || 'Unknown server error. Check the server logs.'
        };
    }
}


/**
 * Captures the payment for a PayPal order after the user has approved it.
 * This function is designed to be crash-proof and always return a JSON response.
 * @param orderId The ID of the order to capture.
 * @returns An object containing the success status and order data or an error and debug info.
 */
export async function capturePaypalOrder(orderId: string): Promise<{success: boolean, orderData?: any, error?: string, debug?: any}> {
    try {
        const tokenResult = await getPayPalAccessToken();
        if (tokenResult.error || !tokenResult.token) {
            return { success: false, error: "Could not authenticate with PayPal after payment approval.", debug: tokenResult.error };
        }
        const accessToken = tokenResult.token;

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                 "PayPal-Request-Id": `capture-${Math.random().toString(36).substring(7)}`,
            },
            signal: AbortSignal.timeout(15000)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("PAYPAL_CAPTURE_ORDER_ERROR:", JSON.stringify(data, null, 2));
            const issue = data.details?.[0]?.issue || data.name || "CAPTURE_FAILED";
            const description = data.details?.[0]?.description || data.message || "Could not capture the payment.";
            return { success: false, error: `PayPal capture failed: ${issue}`, debug: description };
        }
        
        if (data.status === 'COMPLETED') {
            return { success: true, orderData: data };
        } else {
             console.error("PAYPAL_CAPTURE_NOT_COMPLETED:", data);
            return { success: false, error: `Payment not completed. Status: ${data.status}`, debug: data };
        }

    } catch (e: any) {
        console.error("CRITICAL_ERROR_IN_CAPTURE_PAYPAL_ORDER_ACTION:", e);
        return {
            success: false,
            error: "A critical server error occurred while capturing the PayPal order.",
            debug: e.message || 'Unknown server error. Check the server logs.'
        };
    }
}
