'use server';

import { getClient } from '@/lib/paypal-client';
import paypal from '@paypal/checkout-server-sdk';
import { subscriptionTiers } from '@/lib/data';

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
                currency_code: 'USD', // CHANGED FROM 'AUD' to 'USD' for better sandbox compatibility
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
