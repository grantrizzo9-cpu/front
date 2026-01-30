
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
    const client = getClient();
    if (!client) {
        return { error: 'PayPal server-side keys are not configured. Please ensure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set in your .env file and restart the server.' };
    }

    const plan = subscriptionTiers.find(p => p.id === planId);
    if (!plan) {
        return { error: 'Plan not found' };
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE', // CAPTURE for a one-time payment
        purchase_units: [{
            amount: {
                currency_code: 'AUD',
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

    try {
        const order = await client.execute(request);
        return { orderId: order.result.id };
    } catch (err: any) {
        console.error("Error creating PayPal order:", JSON.stringify(err, null, 2));
        
        let userMessage = 'Could not initiate PayPal transaction. The server encountered an error while communicating with PayPal.';

        if (err.statusCode === 401 || (err.message && err.message.includes("AUTHENTICATION_FAILURE"))) {
             userMessage = 'Authentication with PayPal failed. Your server-side PAYPAL_CLIENT_ID and/or PAYPAL_CLIENT_SECRET in the .env file are likely incorrect. Please double-check them and restart the server.';
        } else if (err.statusCode === 422 || err.statusCode === 400) { // Unprocessable Entity or Bad Request
            try {
                // PayPal error messages are often a JSON string in the message property
                const errorDetails = JSON.parse(err.message);
                const issue = errorDetails.details?.[0]?.issue || errorDetails.name;
                const description = errorDetails.details?.[0]?.description || errorDetails.message;
                userMessage = `PayPal rejected the transaction: ${issue}. Details: "${description}"`;
            } catch {
                 userMessage = `PayPal returned an unexpected validation error. Raw message: ${err.message}`;
            }
        } else if (err.message) {
             userMessage = `An unexpected error occurred while communicating with PayPal. Raw message: "${err.message}"`;
        }
        
        return { error: userMessage };
    }
}

/**
 * Captures a PayPal order after the user has approved it.
 * @param orderId The ID of the order to capture.
 * @returns An object indicating success and the captured data, or an error.
 */
export async function capturePaypalOrder(orderId: string) {
    const client = getClient();
    if (!client) {
        return { success: false, error: 'PayPal server-side keys are not configured. Please check your .env file and restart the server.' };
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);

    try {
        const capture = await client.execute(request);
        
        if (capture.result.status === 'COMPLETED') {
            return { success: true, orderData: capture.result };
        } else {
            // This path is unlikely as PayPal usually throws an error for non-completed captures.
            return { success: false, error: `Payment status was not 'COMPLETED'. Status: ${capture.result.status}` };
        }
    } catch (err: any) {
        console.error("Error capturing PayPal order:", err);
        // Provide a generic error to the client for security.
        return { success: false, error: 'There was an issue processing your payment with PayPal. You have not been charged. Please try again.' };
    }
}
