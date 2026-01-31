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
        alert("DIAGNOSTIC: Step 1 - createOrder function has been called. Intentionally forcing an error now to test the error handling.");
        // We are intentionally rejecting the promise to force the onError callback.
        // This will tell us if the PayPal script's error handling is working correctly.
        return Promise.reject(new Error("FORCED_DIAGNOSTIC_ERROR: This is a test to see if the error popup appears."));
    };

    const onApprove = async (data: { orderID: string }) => {
        // This part should not be reached if createOrder fails.
        alert('DIAGNOSTIC: Step X - onApprove was called. This should not have happened during this test.');
        await onPaymentSuccess({});
    };
    
    const onError = (err: any) => {
        // THIS IS THE CRITICAL PART. If this alert appears, we have successfully captured the error.
        const errorMessage = `DIAGNOSTIC SUCCESS: The onError callback was triggered. This confirms the issue is with creating the order. Please copy this entire message. Raw PayPal Error: "${err.toString()}"`;
        alert(errorMessage);
        onPaymentError(errorMessage);
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
