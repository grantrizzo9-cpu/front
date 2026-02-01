"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-20 md:py-32">
        <div className="container max-w-4xl space-y-8">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
          <div className="text-muted-foreground">
            <p>Last updated: July 22, 2024</p>
          </div>
          <div className="space-y-6 text-foreground/90">
            <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
            <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>

            <h2 className="font-headline text-2xl font-semibold pt-4">Collecting and Using Your Personal Data</h2>
            <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to: Email address, First name and last name, Usage Data.</p>
            
            <h2 className="font-headline text-2xl font-semibold pt-4">Use of Your Personal Data</h2>
            <p>The Company may use Personal Data for the following purposes: to provide and maintain our Service, to manage Your Account, for the performance of a contract, to contact You, to provide You with news, special offers and general information about other goods, services and events which we offer.</p>
            
            <h2 className="font-headline text-2xl font-semibold pt-4">Retention of Your Personal Data</h2>
            <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.</p>
            
            <h2 className="font-headline text-2xl font-semibold pt-4">Security of Your Personal Data</h2>
            <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>

            <h2 className="font-headline text-2xl font-semibold pt-4">Changes to this Privacy Policy</h2>
            <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>

            <h2 className="font-headline text-2xl font-semibold pt-4">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, You can contact us by visiting the contact page on our website.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
