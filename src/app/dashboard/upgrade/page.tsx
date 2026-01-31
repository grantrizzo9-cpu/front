
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ArrowUpCircle, BadgeCheck, AlertTriangle } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp, Timestamp } from "firebase/firestore";
import type { User as UserType } from "@/lib/types";
import { subscriptionTiers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { OnApproveData, OnApproveActions, CreateOrderData, CreateOrderActions } from "@paypal/paypal-js";


export default function UpgradePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);
    const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);
    
    const isLoading = isUserLoading || isUserDataLoading;
    
    const isOnTrial = userData?.subscription?.trialEndDate && userData.subscription.trialEndDate.toDate() > new Date();
    const hasPaidSubscription = userData?.subscription && !isOnTrial;

    const handlePlanChange = (tierId: string) => {
        if (!userDocRef) return;
        setIsProcessing(true);
        const newSubscriptionData = {
            ...userData?.subscription,
            tierId: tierId,
        };
        updateDocumentNonBlocking(userDocRef, { subscription: newSubscriptionData });
        toast({ title: "Plan Upgraded!", description: `Your plan has been successfully upgraded.` });
        setIsProcessing(false);
    };

    const createOrder = async (): Promise<string> => {
        setIsProcessing(true);
        setPaymentError(null);

        if (!selectedTierId) {
            const errorMsg = "No subscription tier was selected.";
            setPaymentError(errorMsg);
            setIsProcessing(false);
            throw new Error(errorMsg);
        }

        try {
            const response = await fetch('/api/paypal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create_order', planId: selectedTierId }),
            });

            const orderData = await response.json();

            if (!response.ok || !orderData.success) {
                const errorMsg = orderData.debug || orderData.error || 'Failed to create PayPal order on the server.';
                setPaymentError(errorMsg);
                setIsProcessing(false);
                throw new Error(errorMsg);
            }

            return orderData.orderId;
        } catch (error: any) {
            const errorMsg = `Network error or server is unreachable: ${error.message}`;
            setPaymentError(errorMsg);
            setIsProcessing(false);
            throw new Error(errorMsg);
        }
    };

    const onApprove = async (data: OnApproveData, actions: OnApproveActions): Promise<void> => {
        try {
            const response = await fetch('/api/paypal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'capture_order', orderId: data.orderID }),
            });

            const captureData = await response.json();

            if (!response.ok || !captureData.success) {
                const errorMsg = captureData.debug || captureData.error || 'Failed to capture PayPal payment on the server.';
                setPaymentError(errorMsg);
                setIsProcessing(false);
                return;
            }

            if (userDocRef) {
                const newSubscription = {
                    tierId: selectedTierId,
                    status: 'active' as 'active',
                    startDate: serverTimestamp(),
                    endDate: null,
                    trialEndDate: null, 
                };
                updateDocumentNonBlocking(userDocRef, { subscription: newSubscription });
                toast({ title: "Subscription Activated!", description: "You've successfully subscribed." });
            }
        } catch (error: any) {
             const errorMsg = `Network error while capturing payment: ${error.message}`;
             setPaymentError(errorMsg);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const onError = (err: any) => {
        setPaymentError(`A client-side error occurred with PayPal. This is often due to a configuration issue or network problem. Raw error: ${err.toString()}`);
        setIsProcessing(false);
    };

    if (isLoading) {
        return (
             <div className="flex justify-center items-center h-full p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!hasPaidSubscription && (!paypalClientId || paypalClientId.includes('REPLACE_WITH'))) {
      return (
          <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold font-headline">Choose Your Plan</h1>
                <p className="text-muted-foreground mt-2">Choose a plan below to start your paid subscription.</p>
              </div>
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Payment Gateway Not Configured</AlertTitle>
                  <AlertDescription>
                      The application's payment processing is not yet set up. The `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is missing from the `.env` file. Please add your PayPal Sandbox or Production Client ID to proceed.
                  </AlertDescription>
              </Alert>
          </div>
      );
    }

    const showPaymentFlow = !hasPaidSubscription;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">
                    {hasPaidSubscription ? "Upgrade Your Plan" : (isOnTrial ? "End Trial & Choose Plan" : "Choose Your Plan")}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {hasPaidSubscription 
                        ? `You are currently on the ${subscriptionTiers.find(t => t.id === userData?.subscription?.tierId)?.name || 'Unknown'} plan. Unlock more features by upgrading.`
                        : "Choose a plan below to start your paid subscription."
                    }
                </p>
            </div>

            {showPaymentFlow ? (
                <PayPalScriptProvider options={{ clientId: paypalClientId!, currency: "USD", intent: "capture" }}>
                    {selectedTierId ? (
                        (() => {
                           const tier = subscriptionTiers.find(t => t.id === selectedTierId);
                           if (!tier) return null;
                           return (
                               <Card className="max-w-md mx-auto animate-in fade-in-50">
                                   <CardHeader>
                                       <CardTitle>Confirm Your Plan</CardTitle>
                                       <CardDescription>You are purchasing the <span className="font-bold text-primary">{tier.name}</span> plan.</CardDescription>
                                   </CardHeader>
                                   <CardContent className="space-y-4">
                                        {paymentError && (
                                           <Alert variant="destructive">
                                               <AlertTriangle className="h-4 w-4" />
                                               <AlertTitle>Payment Error</AlertTitle>
                                               <AlertDescription className="break-words">{paymentError}</AlertDescription>
                                           </Alert>
                                       )}
                                       <div className="flex items-baseline gap-2">
                                           <span className="text-4xl font-bold">${tier.price.toFixed(2)}</span>
                                           <span className="text-muted-foreground">USD / day</span>
                                       </div>
                                       <ul className="space-y-3">
                                         {tier.features.map((feature, index) => (
                                           <li key={index} className="flex items-start gap-2">
                                             <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                             <span className="text-sm">{feature}</span>
                                           </li>
                                         ))}
                                       </ul>
                                   </CardContent>
                                   <CardFooter className="flex-col items-stretch gap-4">
                                       <div className="relative">
                                           {isProcessing && (
                                               <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-md">
                                                   <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                                   <p className="mt-2 text-sm text-muted-foreground">Processing...</p>
                                               </div>
                                           )}
                                           <PayPalButtons
                                                style={{ layout: "vertical", label: "pay", tagline: false, height: 44 }}
                                                createOrder={createOrder}
                                                onApprove={onApprove}
                                                onError={onError}
                                                disabled={isProcessing}
                                                forceReRender={[selectedTierId, isProcessing]}
                                            />
                                       </div>
                                       <Button variant="ghost" onClick={() => setSelectedTierId(null)} disabled={isProcessing}>
                                           Choose a different plan
                                       </Button>
                                   </CardFooter>
                               </Card>
                           )
                        })()
                    ) : (
                         <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                              {subscriptionTiers.map((tier) => (
                                <Card 
                                  key={tier.id} 
                                  className={cn(
                                    "flex flex-col",
                                    tier.isMostPopular ? "border-primary ring-2 ring-primary shadow-lg" : ""
                                  )}
                                >
                                  {tier.isMostPopular && (
                                    <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-semibold rounded-t-lg">
                                      Most Popular
                                    </div>
                                  )}
                                  <CardHeader>
                                    <CardTitle className="font-headline text-xl">{tier.name}</CardTitle>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-3xl font-bold">${tier.price.toFixed(2)}</span>
                                      <span className="text-muted-foreground">USD / day</span>
                                    </div>
                                    <CardDescription>{tier.description}</CardDescription>
                                  </CardHeader>
                                  <CardContent className="flex-1">
                                    <ul className="space-y-3">
                                      {tier.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                          <span className="text-sm">{feature}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                  <CardFooter>
                                     <Button className="w-full" variant={tier.isMostPopular ? "default" : "outline"} onClick={() => setSelectedTierId(tier.id)}>
                                        Select {tier.name}
                                     </Button>
                                  </CardFooter>
                                </Card>
                              ))}
                            </div>
                    )}
                </PayPalScriptProvider>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {subscriptionTiers.filter(t => t.price > (subscriptionTiers.find(st => st.id === userData?.subscription?.tierId)?.price ?? 0)).map((tier) => (
                      <Card 
                          key={tier.id} 
                          className={cn(
                              "flex flex-col",
                              tier.isMostPopular ? "border-primary ring-2 ring-primary shadow-lg" : ""
                          )}
                      >
                        {tier.isMostPopular && (
                          <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-semibold rounded-t-lg">
                            Most Popular
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="font-headline text-xl">{tier.name}</CardTitle>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">${tier.price.toFixed(2)}</span>
                            <span className="text-muted-foreground">USD / day</span>
                          </div>
                          <CardDescription>{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <ul className="space-y-3">
                            {tier.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant={tier.isMostPopular ? "default" : "outline"} onClick={() => handlePlanChange(tier.id)} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="animate-spin" /> : <ArrowUpCircle className="mr-2" />}
                                Upgrade to {tier.name}
                            </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

    