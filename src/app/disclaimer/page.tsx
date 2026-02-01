
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function DisclaimerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-20 md:py-32">
        <div className="container max-w-4xl space-y-8">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">Earnings Disclaimer</h1>
          <div className="text-muted-foreground">
            <p>Last updated: July 22, 2024</p>
          </div>
          <div className="space-y-6 text-foreground/90">
            <p>We make every effort to ensure that we accurately represent our products and services and their potential for income. Earning and income statements made by our company and its customers are estimates of what we think you can possibly earn. There is no guarantee that you will make these levels of income and you accept the risk that the earnings and income statements differ by individual.</p>
            
            <p>As with any business, your results may vary, and will be based on your individual capacity, business experience, expertise, and level of desire. There are no guarantees concerning the level of success you may experience. The testimonials and examples used are exceptional results, which do not apply to the average purchaser, and are not intended to represent or guarantee that anyone will achieve the same or similar results.</p>
            
            <p>Each individual’s success depends on his or her background, dedication, desire and motivation. There is no assurance that examples of past earnings can be duplicated in the future. We cannot guarantee your future results and/or success. There are some unknown risks in business and on the internet that we cannot foresee which could reduce results you experience.</p>
            
            <p>The use of our information, products and services should be based on your own due diligence and you agree that our company is not liable for any success or failure of your business that is directly or indirectly related to the purchase and use of our information, products and services.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
