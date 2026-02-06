"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PricingCards } from "./pricing-cards";
import { Suspense } from "react";

export function PricingContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl heading-red">
              Find the Perfect Plan
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
              All plans start with a 3-day trial. A one-time activation fee, equal to one day's price, is required to get started. This admin fee goes to the platform owner.
            </p>
          </div>
        </section>

        <section className="pb-20 md:pb-32">
          <div className="container">
            <Suspense fallback={<div className="grid grid-cols-1 gap-8 md:grid-cols-3"><div className="h-64 bg-slate-100 animate-pulse rounded-lg" /><div className="h-64 bg-slate-100 animate-pulse rounded-lg" /><div className="h-64 bg-slate-100 animate-pulse rounded-lg" /></div>}>
              <PricingCards />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}