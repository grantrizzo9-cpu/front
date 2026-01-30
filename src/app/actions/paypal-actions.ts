'use server';

import { subscriptionTiers } from "@/lib/data";

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

/**
 * Gets a PayPal access token.
 * This function caches the token to avoid re-requesting on every call.
 * This is now an internal helper function and is not exported.
 */
async function getPayPalAccessToken(): Promise<{ token?: string; error?: string }> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes('REPLACE_WITH') || clientSecret.includes('REPLACE_WITH')) {
    return { error: "PayPal server credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not configured correctly in the .env file." };
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("PAYPAL_TOKEN_ERROR_BODY:", errorBody);
        return { error: `Failed to get PayPal access token. Status: ${response.status}. Body: ${errorBody}`};
    }

    const data = await response.json();
    return { token: data.access_token };
  } catch (e: any) {
    console.error("GET_PAYPAL_ACCESS_TOKEN_CATCH_BLOCK:", e);
    return { error: `An unexpected network error occurred while getting the PayPal token: ${e.message}`};
  }
}


/**
 * Creates a PayPal order for a one-time payment for the selected subscription plan.
 * This function is designed to be crash-proof and always return a JSON response.
 * @param planId The ID of the subscription tier to purchase.
 * @returns An object containing the orderId or an error and debug info.
 */
export async function createPaypalOrder(planId: string): Promise<{orderId?: string; error?: string; debug?: string}> {
    try {
        const tokenResult = await getPayPalAccessToken();
        if (tokenResult.error || !tokenResult.token) {
            return { error: "Could not authenticate with PayPal.", debug: tokenResult.error };
        }
        const accessToken = tokenResult.token;

        const plan = subscriptionTiers.find(p => p.id === planId);
        if (!plan) {
            return { error: 'Plan not found' };
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
            }
        };

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("PAYPAL_CREATE_ORDER_ERROR:", JSON.stringify(data, null, 2));
            const issue = data.details?.[0]?.issue || data.name || "UNKNOWN_ISSUE";
            const description = data.details?.[0]?.description || data.message || "An error occurred while creating the order.";
            return { error: `PayPal Error: ${issue}`, debug: description };
        }

        return { orderId: data.id };

    } catch (e: any) {
        console.error("CRITICAL_ERROR_IN_CREATE_PAYPAL_ORDER_ACTION:", e);
        return {
            error: "A critical unhandled error occurred on the server while creating the PayPal order.",
            debug: e.message || 'Unknown server error'
        };
    }
}


/**
 * Captures the payment for a PayPal order after the user has approved it.
 * This function is designed to be crash-proof and always return a JSON response.
 * @param orderId The ID of the order to capture.
 * @returns An object containing the success status and order data or an error and debug info.
 */
export async function capturePaypalOrder(orderId: string): Promise<{success: boolean, orderData?: any, error?: string, debug?: string}> {
    try {
        const tokenResult = await getPayPalAccessToken();
        if (tokenResult.error || !tokenResult.token) {
            return { success: false, error: "Could not authenticate with PayPal.", debug: tokenResult.error };
        }
        const accessToken = tokenResult.token;

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
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
            return { success: false, error: `Payment not completed. Status: ${data.status}` };
        }

    } catch (e: any) {
        console.error("CRITICAL_ERROR_IN_CAPTURE_PAYPAL_ORDER_ACTION:", e);
        return {
            success: false,
            error: "A critical unhandled error occurred on the server while capturing the PayPal order.",
            debug: e.message || 'Unknown server error'
        };
    }
}
