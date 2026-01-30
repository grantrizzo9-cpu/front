'use server';

import { subscriptionTiers } from "@/lib/data";

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

// This function will be more robust and have better logging.
async function getPayPalAccessToken(): Promise<{ token?: string; error?: string }> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes('REPLACE_WITH') || clientSecret.includes('REPLACE_WITH')) {
    const errorMsg = "PayPal server credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not configured correctly in the .env file.";
    console.error("getPayPalAccessToken Error:", errorMsg);
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
        signal: AbortSignal.timeout(10000) 
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("PAYPAL_TOKEN_ERROR:", JSON.stringify(data, null, 2));
        return { error: `Failed to get PayPal access token. Status: ${response.status}. Response: ${JSON.stringify(data)}` };
    }

    if (!data.access_token) {
        console.error("PAYPAL_TOKEN_ERROR: No access_token in response", JSON.stringify(data, null, 2));
        return { error: `PayPal authentication succeeded but no access token was returned.` };
    }

    return { token: data.access_token };
  } catch (e: any) {
    console.error("GET_PAYPAL_ACCESS_TOKEN_CATCH_BLOCK:", e);
    return { error: `A critical network error occurred while getting the PayPal token: ${e.message}` };
  }
}

export async function createPaypalOrder(planId: string): Promise<{orderId?: string; error?: string; debug?: any}> {
    console.log(`[SERVER] createPaypalOrder started for planId: ${planId}`);
    try {
        const tokenResult = await getPayPalAccessToken();
        if (tokenResult.error || !tokenResult.token) {
            console.error("[SERVER] Failed to get access token:", tokenResult.error);
            return { error: "Could not authenticate with PayPal.", debug: tokenResult.error };
        }
        const accessToken = tokenResult.token;
        console.log("[SERVER] Access token obtained successfully.");

        const plan = subscriptionTiers.find(p => p.id === planId);
        if (!plan) {
            console.error(`[SERVER] Plan with ID '${planId}' not found.`);
            return { error: 'The selected plan could not be found on the server.' };
        }
        console.log(`[SERVER] Found plan: ${plan.name} with price ${plan.price}`);

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
                return_url: 'https://example.com/return', 
                cancel_url: 'https://example.com/cancel',
            }
        };
        console.log("[SERVER] Creating PayPal order with payload:", JSON.stringify(payload, null, 2));

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                "PayPal-Request-Id": `order-${Date.now()}`,
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15000)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[SERVER] PAYPAL_CREATE_ORDER_ERROR:", JSON.stringify(data, null, 2));
            const issue = data.details?.[0]?.issue || data.name || "UNKNOWN_ISSUE";
            const description = data.details?.[0]?.description || data.message || "An error occurred while creating the order.";
            return { error: `PayPal Error: ${issue}`, debug: description };
        }

        if (!data.id) {
            console.error("[SERVER] PAYPAL_CREATE_ORDER_NO_ID:", data);
            return { error: "PayPal did not return an order ID.", debug: data };
        }
        
        console.log(`[SERVER] Successfully created PayPal order with ID: ${data.id}`);
        return { orderId: data.id };

    } catch (e: any) {
        console.error("[SERVER] CRITICAL_ERROR_IN_CREATE_PAYPAL_ORDER_ACTION:", e);
        // This is the most important part - ensuring a structured error is always returned
        return {
            error: "A critical server error occurred. This is a bug in the application.",
            debug: e.message || 'Unknown server error. Check the server logs for a message starting with [SERVER].'
        };
    }
}


export async function capturePaypalOrder(orderId: string): Promise<{success: boolean, orderData?: any, error?: string, debug?: any}> {
    // This function is less critical right now, but I'll add similar logging for consistency.
    console.log(`[SERVER] capturePaypalOrder started for orderId: ${orderId}`);
    try {
        const tokenResult = await getPayPalAccessToken();
        if (tokenResult.error || !tokenResult.token) {
            console.error("[SERVER] Failed to get access token for capture:", tokenResult.error);
            return { success: false, error: "Could not authenticate with PayPal after payment approval.", debug: tokenResult.error };
        }
        const accessToken = tokenResult.token;

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                 "PayPal-Request-Id": `capture-${Date.now()}`,
            },
            signal: AbortSignal.timeout(20000)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[SERVER] PAYPAL_CAPTURE_ORDER_ERROR:", JSON.stringify(data, null, 2));
            const issue = data.details?.[0]?.issue || data.name || "CAPTURE_FAILED";
            const description = data.details?.[0]?.description || data.message || "Could not capture the payment.";
            return { success: false, error: `PayPal capture failed: ${issue}`, debug: description };
        }
        
        if (data.status === 'COMPLETED') {
            console.log(`[SERVER] Successfully captured PayPal order with ID: ${orderId}`);
            return { success: true, orderData: data };
        } else {
             console.error("[SERVER] PAYPAL_CAPTURE_NOT_COMPLETED:", data);
            return { success: false, error: `Payment not completed. Status: ${data.status}`, debug: data };
        }

    } catch (e: any) {
        console.error("[SERVER] CRITICAL_ERROR_IN_CAPTURE_PAYPAL_ORDER_ACTION:", e);
        return {
            success: false,
            error: "A critical server error occurred while capturing the PayPal order.",
            debug: e.message || 'Unknown server error. Check the server logs.'
        };
    }
}
