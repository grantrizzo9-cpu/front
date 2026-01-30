import { subscriptionTiers } from "@/lib/data";

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

/**
 * Gets a PayPal access token.
 * This function caches the token to avoid re-requesting on every call.
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes('REPLACE_WITH') || clientSecret.includes('REPLACE_WITH')) {
    throw new Error("MISSING_PAYPAL_CREDENTIALS");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

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
    throw new Error(`Failed to get PayPal access token. Status: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Creates a new PayPal order using the v2 API directly.
 */
export async function createOrder(planId: string): Promise<{orderId: string} | {error: string}> {
  try {
    const accessToken = await getPayPalAccessToken();
    const url = `${PAYPAL_API_BASE}/v2/checkout/orders`;
    
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
    
    console.log("PAYPAL_DEBUG: Creating order with payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
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
      const issue = data.details?.[0]?.issue || "UNKNOWN_ISSUE";
      const description = data.details?.[0]?.description || "An error occurred while creating the order.";
      return { error: `PayPal Error: ${issue} - ${description}` };
    }

    console.log("PAYPAL_DEBUG: Order created successfully. ID:", data.id);
    return { orderId: data.id };

  } catch (error: any) {
    console.error("PAYPAL_CREATE_ORDER_CATCH_BLOCK:", error);
    if (error.message === "MISSING_PAYPAL_CREDENTIALS") {
        return { error: "PayPal server credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not configured in the .env file." };
    }
    return { error: `An unexpected server error occurred: ${error.message}` };
  }
}

/**
 * Captures a PayPal order using the v2 API directly.
 */
export async function captureOrder(orderId: string): Promise<{success: boolean, orderData?: any, error?: string}> {
  try {
    const accessToken = await getPayPalAccessToken();
    const url = `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`;
    
    console.log("PAYPAL_DEBUG: Capturing order for ID:", orderId);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
       console.error("PAYPAL_CAPTURE_ORDER_ERROR:", JSON.stringify(data, null, 2));
       const issue = data.details?.[0]?.issue || "CAPTURE_FAILED";
       const description = data.details?.[0]?.description || "Could not capture the payment.";
       return { success: false, error: `PayPal capture failed: ${issue}. Details: "${description}"` };
    }
    
    console.log("PAYPAL_DEBUG: Order captured successfully.");
    if (data.status === 'COMPLETED') {
      return { success: true, orderData: data };
    } else {
      return { success: false, error: `Payment not completed. Status: ${data.status}` };
    }

  } catch (error: any) {
    console.error("PAYPAL_CAPTURE_ORDER_CATCH_BLOCK:", error);
    return { success: false, error: `An unexpected server error occurred during capture: ${error.message}` };
  }
}
