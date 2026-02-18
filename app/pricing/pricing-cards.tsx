"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { subscriptionTiers } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function PricingCards() {
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const refCode = isHydrated ? searchParams.get("ref") : null;

  const getSignupLink = (tierId: string) => {
    let link = `/signup?plan=${tierId}`;
    if (refCode) {
      link += `&ref=${refCode}`;
    }
    return link;
  };

  if (!isHydrated) {
    return <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 w-full"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="font-headline text-2xl">{tier.name}</CardTitle>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">${tier.price.toFixed(2)}</span>
              <span className="text-muted-foreground font-semibold">AUD / day</span>
            </div>
            <CardDescription>{tier.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full h-12 text-lg font-bold" variant={tier.isMostPopular ? "default" : "outline"}>
              <Link href={getSignupLink(tier.id)}>Get Started (AUD)</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
