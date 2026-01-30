'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';

interface PayPalPaymentButtonProps {
    planId: string;
    onPaymentSuccess: (details: any) => Promise<void>;
    onPaymentStart: () => void;
    onPaymentError: (error: string) => void;
    disabled: boolean;
}

export function PayPalPaymentButton({ planId, onPaymentSuccess, onPaymentStart, onPaymentError, disabled }: PayPalPaymentButtonProps) {

    const createOrder = async (): Promise<string> => {
        alert("DIAGNOSTIC: Step 1 - createOrder has been called. Attempting to contact the server to create an order.");
        onPaymentStart();
        try {
            const response = await fetch('/api/paypal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_order',
                    planId: planId
                }),
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                const errorText = `Server Error: ${result.error || 'An unexpected error occurred.'} ${result.debug ? `(Debug: ${result.debug})` : ''}`;
                alert(`DIAGNOSTIC: Step 2 FAILED - Server returned an error: ${errorText}`);
                onPaymentError(errorText);
                return Promise.reject(new Error(errorText));
            }
            
            if (!result.orderId) {
                const errorMessage = "Server succeeded but did not return a PayPal order ID.";
                alert(`DIAGNOSTIC: Step 2 FAILED - No order ID: ${errorMessage}`);
                onPaymentError(errorMessage);
                return Promise.reject(new Error(errorMessage));
            }
            
            alert(`DIAGNOSTIC: Step 2 SUCCEEDED - Got Order ID: ${result.orderId}. Handing off to PayPal.`);
            return result.orderId;

        } catch (error: any) {
            const errorMessage = `A critical client-side error occurred while trying to create the order: ${error.message}`;
            alert(`DIAGNOSTIC: Step 2 FAILED - A critical error occurred during fetch: ${errorMessage}`);
            onPaymentError(errorMessage);
            return Promise.reject(new Error(errorMessage));
        }
    };

    const onApprove = async (data: { orderID: string }) => {
        alert(`DIAGNOSTIC: Step 3 - Payment approved by user. Order ID: ${data.orderID}. Now attempting to capture on server.`);
        try {
            const response = await fetch('/api/paypal', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                    action: 'capture_order',
                    orderId: data.orderID
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                 const errorMessage = `Payment capture failed: ${result.error || 'Unknown server error.'} ${result.debug ? `(Debug: ${result.debug})` : ''}`;
                 alert(`DIAGNOSTIC: Step 4 FAILED - Server capture failed: ${errorMessage}`);
                 onPaymentError(errorMessage);
                 return;
            }

            alert('DIAGNOSTIC: Step 4 SUCCEEDED - Capture successful. Finalizing subscription.');
            await onPaymentSuccess(result.orderData);

        } catch (error: any) {
             const errorMessage = `A critical error occurred during payment capture: ${error.message}`;
             alert(`DIAGNOSTIC: Step 4 FAILED - Critical error during capture fetch: ${errorMessage}`);
             onPaymentError(errorMessage);
        }
    };
    
    const onError = (err: any) => {
        const message = `The PayPal script encountered an error or the window was closed unexpectedly. This can happen if you close the popup manually. Raw PayPal Error: "${err.toString()}"`;
        alert(`DIAGNOSTIC: The generic 'onError' event was triggered. This often means the popup was closed or there was an issue within PayPal's system. Details: ${message}`);
        onPaymentError(message);
    }

    return (
        <PayPalButtons
            style={{ layout: "vertical", label: "pay", tagline: false, height: 44 }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            disabled={disabled}
            forceReRender={[planId, disabled]}
        />
    );
}
