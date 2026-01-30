
'use server';

import paypal from '@paypal/checkout-server-sdk';
import { subscriptionTiers } from '@/lib/data';


/**
 * Initializes and returns a new PayPal HTTP client.
 * This is safer for serverless environments as it doesn't rely on a cached instance.
 * Returns null and logs a warning if credentials are not properly configured.
 */
function getClient(): paypal.core.PayPalHttpClient | null {
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
        // FORCE SANDBOX ENVIRONMENT: This was the likely source of the error.
        // We are now explicitly using the SandboxEnvironment to match the sandbox keys.
        const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
        
        const client = new paypal.core.PayPalHttpClient(environment);
        return client;
    } catch (error) {
        console.error("CRITICAL: Failed to initialize PayPal client. Your credentials in the .env file may be invalid or malformed.", error);
        return null;
    }
}


/**
 * Creates a PayPal order for a one-time payment for the selected subscription plan.
 * @param planId The ID of the subscription tier to purchase.
 * @returns An object containing the orderId or an error.
 */
export async function createPaypalOrder(planId: string) {
    console.log("PAYPAL_DEBUG: createPaypalOrder server action started for planId:", planId);

    const client = getClient();
    if (!client) {
        console.error("PAYPAL_DEBUG: getClient() returned null. Check server-side keys.");
        return { error: 'PayPal server-side keys are not configured. Please ensure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set in your .env file and restart the server.' };
    }
    console.log("PAYPAL_DEBUG: PayPal client initialized.");

    const plan = subscriptionTiers.find(p => p.id === planId);
    if (!plan) {
        console.error("PAYPAL_DEBUG: Plan not found for planId:", planId);
        return { error: 'Plan not found' };
    }
    console.log("PAYPAL_DEBUG: Found plan:", plan.name, "with price:", plan.price);

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE', // CAPTURE for a one-time payment
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
    });
    console.log("PAYPAL_DEBUG: PayPal order request body created:", JSON.stringify(request.requestBody, null, 2));

    try {
        console.log("PAYPAL_DEBUG: Executing PayPal order request...");
        const order = await client.execute(request);
        console.log("PAYPAL_DEBUG: PayPal order created successfully. Order ID:", order.result.id);
        return { orderId: order.result.id };
    } catch (err: any) {
        console.error("PAYPAL_DEBUG: Error executing PayPal order request. Raw Error:", JSON.stringify(err, null, 2));
        
        let userMessage = 'Could not initiate PayPal transaction. The server encountered an error while communicating with PayPal.';

        if (err.statusCode === 401 || (err.message && err.message.includes("AUTHENTICATION_FAILURE"))) {
             userMessage = 'Authentication with PayPal failed. Your server-side PAYPAL_CLIENT_ID and/or PAYPAL_CLIENT_SECRET in the .env file are likely incorrect. Please double-check them and restart the server.';
        } else if (err.statusCode === 422) { // Unprocessable Entity
             try {
                const errorDetails = JSON.parse(err.message);
                const issue = errorDetails.details?.[0]?.issue || 'UNPROCESSABLE_ENTITY';
                const description = errorDetails.details?.[0]?.description || 'PayPal could not process the transaction, possibly due to currency or account setup issues.';
                userMessage = `PayPal rejected the transaction: ${issue}. Details: "${description}"`;
            } catch {
                 userMessage = `PayPal returned an unexpected validation error (422). Raw message: ${err.message}`;
            }
        } else if (err.message) {
             userMessage = `An unexpected error occurred while communicating with PayPal. Raw message: "${err.message}"`;
        }
        
        console.error("PAYPAL_DEBUG: Final user message:", userMessage);
        return { error: userMessage };
    }
}


/**
 * Captures the payment for a PayPal order after the user has approved it.
 * @param orderId The ID of the order to capture.
 * @returns An object containing the success status and order data or an error.
 */
export async function capturePaypalOrder(orderId: string) {
    const client = getClient();
    if (!client) {
        return { error: 'PayPal client not initialized on server.' };
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const capture = await client.execute(request);
        const orderData = capture.result;
        
        if (orderData.status === 'COMPLETED') {
            return { success: true, orderData: orderData };
        } else {
            return { error: `Payment not completed. Status: ${orderData.status}` };
        }
    } catch (err: any) {
        console.error("PayPal Capture Error:", err);
        const errorMessage = err.message || 'Failed to capture PayPal order.';
        // Attempt to parse a more detailed message from PayPal's response
        try {
            const detailedError = JSON.parse(err.message);
            const issue = detailedError.details?.[0]?.issue || 'CAPTURE_FAILED';
            const description = detailedError.details?.[0]?.description || 'Could not capture the payment.';
            return { error: `PayPal capture failed: ${issue}. Details: "${description}"` };
        } catch {
            // Fallback to the generic error
            return { error: errorMessage };
        }
    }
}

