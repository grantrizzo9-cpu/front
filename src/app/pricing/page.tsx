"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Suspense } from "react";
import { PricingCards } from "./pricing-cards";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingPricingCards() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="flex flex-col">
          <div className="p-6 space-y-4">
             <Skeleton className="h-6 w-1/2" />
             <Skeleton className="h-8 w-1/3" />
             <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="p-6 pt-0 flex-1">
             <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
              ))}
             </div>
          </div>
          <div className="p-6 pt-0">
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Find the Perfect Plan
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
              Choose a plan to get started. All plans start with a 70% affiliate commission rate, which can increase to 75% with performance. Become an affiliate by signing up.
            </p>
          </div>
        </section>

        <section className="pb-20 md:pb-32">
          <div className="container">
            <Suspense fallback={<LoadingPricingCards />}>
                <PricingCards />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
