import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-20 md:py-32">
        <div className="container max-w-4xl space-y-8">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">Terms of Service</h1>
          <div className="text-muted-foreground">
            <p>Last updated: July 22, 2024</p>
          </div>
          <div className="space-y-6 text-foreground/90">
            <p>Please read these terms and conditions carefully before using Our Service.</p>
            
            <h2 className="font-headline text-2xl font-semibold pt-4">Acknowledgment</h2>
            <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
            <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
            <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>
            
            <h2 className="font-headline text-2xl font-semibold pt-4">Links to Other Websites</h2>
            <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.</p>
            <p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>
            
            <h2 className="font-headline text-2xl font-semibold pt-4">Termination</h2>
            <p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>
            <p>Upon termination, Your right to use the Service will cease immediately.</p>
            
            <h2 className="font-headline text-2xl font-semibold pt-4">Governing Law</h2>
            <p>The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>
            
            <h2 className="font-headline text-2xl font-semibold pt-4">Changes to These Terms and Conditions</h2>
            <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>
            
            <h2 className="font-headline text-2xl font-semibold pt-4">Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, you can contact us by visiting the contact page on our website.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
