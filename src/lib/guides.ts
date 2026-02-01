

export type Guide = {
  title: string;
  level: 'starter' | 'plus' | 'pro' | 'business' | 'scale' | 'enterprise';
  content: string;
  imageId: string;
};

export const allGuides: Guide[] = [
  // New Lead Magnet Guide
  {
    title: "The 5-Step Checklist to Launching a Profitable Affiliate Website in 24 Hours",
    level: "starter",
    imageId: "guide-checklist-launch",
    content: `
        <p>Congratulations! This exclusive checklist is your rapid-launch plan. Follow these five steps to get your affiliate site live and ready to earn in just 24 hours.</p>

        <h3>Step 1: Choose Your Domain & Niche (First 2 Hours)</h3>
        <p>A great domain name is memorable and relevant. Your niche is the specific audience you're targeting.</p>
        <ul>
            <li><strong>Brainstorm:</strong> List 10 domain names related to 'AI', 'hosting', 'affiliate', or 'passive income'.</li>
            <li><strong>Check Availability:</strong> Use a registrar like Name.com to see if your top choices are available.</li>
            <li><strong>Keep it Simple:</strong> Aim for a .com that's easy to say and spell.</li>
            <li><strong>Decision:</strong> Purchase your domain. This is your digital real estate!</li>
        </ul>

        <h3>Step 2: Launch Your Website (Next 2 Hours)</h3>
        <p>This is the easy part. Our platform is built for speed.</p>
        <ul>
            <li><strong>Sign Up:</strong> If you haven't already, sign up for an Affiliate AI Host plan using this link: <strong>https://hostproai.com/?ref=rentahost</strong></li>
            <li><strong>Connect Domain:</strong> Follow our "Pre-Launch Checklist" guide to connect your domain to our hosting. While you wait for it to go live, you can start on the next step.</li>
        </ul>

        <h3>Step 3: Create Your Core Content (Next 8 Hours)</h3>
        <p>Content is what attracts visitors. You need two key pages to start.</p>
        <ul>
            <li><strong>'About Me' Page:</strong> Write a short page introducing yourself and why you're recommending Affiliate AI Host. Build trust by being authentic.</li>
            <li><strong>The "Money" Page - Your Review:</strong> Write a detailed review of Affiliate AI Host. Use the "Content is King" guide for a full template. Include your personal experience, screenshots, and sprinkle your affiliate link throughout. This is your most important sales tool.</li>
        </ul>

        <h3>Step 4: Your First Promotion Blitz (Next 10 Hours)</h3>
        <p>A great site with no visitors earns nothing. It's time for outreach.</p>
        <ul>
            <li><strong>Social Media:</strong> Use the templates from our "Social Media Marketing 101" guide to post on Facebook, X/Twitter, and LinkedIn.</li>
            <li><strong>Relevant Communities:</strong> Find 3 online communities where your target audience hangs out (e.g., Reddit's r/affiliatemarketing, Facebook groups). Share your review, but be helpful first! Answer questions before you post your link.</li>
            <li><strong>Tell Your Friends:</strong> Send a personal message to 5 friends who might be interested in starting an online business.</li>
        </ul>

        <h3>Step 5: Review & Track (Final 2 Hours)</h3>
        <p>Check your work and get ready for results.</p>
        <ul>
            <li><strong>Check Your Links:</strong> Click every link on your new website to make sure they work, especially your affiliate links!</li>
            <li><strong>Monitor Your Dashboard:</strong> Keep an eye on your Affiliate AI Host dashboard to see new referrals as they come in.</li>
            <li><strong>Celebrate:</strong> You've just launched a real online business. Well done!</li>
        </ul>
    `
  },
  // Starter Guides
  {
    title: "Understanding Your Affiliate Link & Dashboard",
    level: "starter",
    imageId: "guide-dashboard-link",
    content: `
        <p>Welcome to the first step of your affiliate journey! This guide will make you comfortable with your two most important tools: your affiliate link and your dashboard.</p>
        <strong>1. Your Unique Affiliate Link:</strong>
        <p>Your affiliate link is your personal signature. It looks something like this: <code>https://hostproai.com/?ref=[YOUR_USERNAME_HERE]</code>. When someone clicks this link, our system places a special tracking cookie in their browser. This cookie tells us that YOU sent them. If they sign up (even days or weeks later), the sale is credited to you.</p>
        <ul>
            <li><strong>Where to find it:</strong> Go to your <a href="/dashboard/settings" class="text-primary hover:underline">Settings</a> page. It's right there at the top.</li>
            <li><strong>Rule #1:</strong> Always use your full, unique link. Don't shorten it or alter it, or the tracking might not work.</li>
        </ul>
        <strong>2. Your Dashboard: Your Command Center</strong>
        <p>Your <a href="/dashboard" class="text-primary hover:underline">Dashboard</a> is where you see your efforts pay off in real-time. Here’s what to look at:</p>
        <ul>
            <li><strong>Total Earnings:</strong> Your all-time commission total.</li>
            <li><strong>Total Referrals:</strong> The number of people who have signed up using your link.</li>
            <li><strong>Unpaid Commissions:</strong> The amount you're scheduled to receive in the next daily payout.</li>
            <li><strong>Recent Referrals Table:</strong> A list of your latest sign-ups, the plan they purchased, and your commission for each.</li>
        </ul>
        <p><strong>Your Mission:</strong> Get your link in front of people who need great web hosting and AI tools. Every guide that follows will teach you exactly how to do that.</p>
    `
  },
  {
    title: "Your First Affiliate Website: A Step-by-Step Guide for Beginners",
    level: "starter",
    imageId: "guide-website-forwarding",
    content: `
      <p>Welcome to the most powerful and simple way to start your affiliate business. Forget about coding or building a website from scratch. This guide will show you how to get a professional, ready-to-go affiliate website in under 30 minutes.</p>
      
      <h3>The Big Idea: Your Own Domain, Our Powerful Website</h3>
      <p>Instead of building a website, you're going to use a simple trick that all pro marketers use. You'll get your own custom domain name (like <code>www.joes-ai-reviews.com</code>) and point it directly to the Affiliate AI Host website, but with your special tracking link attached. </p>
      <p><strong>The result:</strong> When you tell someone to go to your domain, they see a beautiful, professional sales website with all the information they need. And because it uses your special link, you get credit for every single sale!</p>
      
      <hr class="my-6 border-border" />
      
      <h3>Step 1: Find Your "Golden Key" (Your Affiliate Link)</h3>
      <p>This is the most important piece of the puzzle. Your affiliate link is what tells us you sent a customer.</p>
      <ol>
        <li>Go to your <a href="/dashboard/settings" target="_blank" class="text-primary font-semibold hover:underline">Affiliate Settings Page</a>.</li>
        <li>Copy your unique affiliate link. It will look like this: <code>https://hostproai.com/?ref=[your-username]</code></li>
        <li>Paste this link into a notepad or text file. You'll need it in a moment.</li>
      </ol>
      
      <h3>Step 2: Buy Your Piece of the Internet (Your Domain Name)</h3>
      <p>A domain name makes you look professional. Telling someone to visit <code>www.bills-business.com</code> is much better than a long, complicated link.</p>
      <ol>
        <li>Go to a domain registrar website. We recommend <a href="https://name.com" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline">Name.com</a> or <a href="https://domains.google" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline">Google Domains</a> because they are simple to use.</li>
        <li>Search for a domain name. Try to include words like 'AI', 'hosting', 'reviews', 'affiliate', or your own name.</li>
        <li>Choose a <code>.com</code> if you can. It's the most recognized.</li>
        <li>Buy the domain! It usually costs about $10-15 for a whole year. You now own that piece of the internet.</li>
      </ol>
      
      <h3>Step 3: The Secret Weapon (Domain Forwarding)</h3>
      <p>This is where the magic happens. You're going to tell your new domain name to "forward" any visitors to your affiliate link.</p>
      <ol>
        <li>In your domain registrar's account (like Name.com), find your new domain and look for a setting called <strong>"Forwarding"</strong>, "Domain Forwarding", or "Redirect". It's often in the DNS settings section.</li>
        <li>You will see a box that asks where you want to forward your domain to.</li>
        <li>Paste your "Golden Key" (your full affiliate link from Step 1) into this box.</li>
        <li>Make sure the forwarding type is set to **"Permanent (301)"** if you have the option.</li>
        <li>Save your changes.</li>
      </ol>
      
      <hr class="my-6 border-border" />
      
      <h3>You're Done! What Happens Now?</h3>
      <p>It can take a few minutes (sometimes up to an hour) for the change to work across the whole internet.</p>
      <p>Once it's ready, you can open a new browser window and type in your new domain name (e.g., <code>www.joes-ai-reviews.com</code>). You will see it instantly redirect to the Affiliate AI Host homepage. Look at the address bar – you should see your affiliate `?ref=` code at the end of the URL!</p>
      <p>You now have a fully functional, professional affiliate website. You can now put YOUR simple domain name on your social media profiles, in emails, and on business cards. Congratulations!</p>
    `
  },
  {
    title: "Social Media Marketing 101: Your First Ads",
    level: "starter",
    imageId: "guide-social-media",
    content: `
        <p>Social media is the fastest way to get your link in front of people. But don't just spam it! The key is to be helpful and genuine. Here are copy-paste templates for your first posts.</p>
        
        <strong>Template for Facebook / LinkedIn:</strong>
        <blockquote>
            <p>Been exploring some incredible AI-powered tools for building websites and growing a business online. Affiliate AI Host combines high-speed hosting with a content generator that's actually useful.</p>
            <p>Plus, their affiliate program is one of the best I've seen (70% commissions, paid daily!). If you're looking to start an online project or side-hustle, this is a great place to begin. They have a trial where you only pay for the first day to check it out.</p>
            <p>Check it out here: <strong>https://hostproai.com/?ref=[YOUR_USERNAME_HERE]</strong></p>
            <p>#webhosting #aicontent #affiliatemarketing #sidehustle</p>
        </blockquote>

        <strong>Template for X (Twitter):</strong>
        <blockquote>
            <p>Just found a hosting platform that pays its affiliates 70% commissions DAILY via PayPal. 🤯</p>
            <p>Affiliate AI Host bundles hosting with AI content tools. It's a super easy offer for anyone wanting to build a site or start an online business.</p>
            <p>Worth a look 👇<br><strong>https://hostproai.com/?ref=[YOUR_USERNAME_HERE]</strong></p>
            <p>#affiliatemarketing #saas #mrr</p>
        </blockquote>
        <p><strong>Where to post:</strong> Your personal profile, relevant Facebook groups (check rules first!), LinkedIn articles, and your X/Twitter feed. Customize the message to fit your voice!</p>
    `
  },
  
  // Plus Guides
  {
    title: "Content is King: Writing Compelling Product Reviews",
    level: "plus",
    imageId: "guide-content-writing",
    content: `
        <p>A detailed, honest product review is one of the most powerful affiliate marketing tools. Your review is your sales page. Go beyond the feature list. Talk about your personal experience, the pros and cons, and who would benefit most from the service. Use screenshots and be authentic.</p>
        <strong>Review Structure to Follow:</strong>
        <ul>
            <li><strong>Catchy Title:</strong> e.g., "Affiliate AI Host Review: Is Daily Pay & 70% Commission Legit?"</li>
            <li><strong>Introduction:</strong> Hook the reader by stating the biggest benefit (e.g., daily income).</li>
            <li><strong>What is Affiliate AI Host?:</strong> Briefly explain the product (AI Tools + Hosting).</li>
            <li><strong>Key Features:</strong> Detail the best parts (70-75% commission, daily payouts, AI tools).</li>
            <li><strong>Walkthrough:</strong> Show screenshots of the dashboard and tools.</li>
            <li><strong>Pricing:</strong> Explain the value of the different tiers.</li>
            <li><strong>Conclusion:</strong> Summarize and give your final recommendation with a strong call-to-action.</li>
        </ul>
        <p><strong>Crucial Tip:</strong> Sprinkle your affiliate link naturally throughout the article, especially at the beginning and end, and whenever you mention signing up.</p>
    `
  },
  {
    title: "Email Marketing Basics: Building Your First List",
    level: "plus",
    imageId: "guide-email-marketing",
    content: `
      <p>An email list is a direct line to your audience and one of your most valuable assets. Unlike social media, you OWN your list.</p>
      <p>To start building your list, you'll need an email marketing service. There are many great options available, many of which offer free starting plans.</p>
      <strong>General Steps to Start Your List:</strong>
      <ol>
          <li><strong>Choose a Service:</strong> Sign up for a reputable email marketing platform like MailerLite, ConvertKit, or Brevo.</li>
          <li><strong>Create a 'Lead Magnet':</strong> Offer something valuable for free in exchange for an email. Your "5-Step Launch Checklist" is perfect for this.</li>
          <li><strong>Add a Sign-up Form:</strong> Your chosen email service will provide you with a way to add a form to your website or social media bio.</li>
          <li><strong>Nurture Your List:</strong> Send a welcome email with the lead magnet, followed by a mix of helpful content and promotional emails. The 7-Day sequence in your guides is a great starting point.</li>
      </ol>
      <p>In your promotional emails, share the benefits of Affiliate AI Host and include your affiliate link.</p>
    `
  },

  // Pro Guides
  {
    title: "Your Pre-Launch Checklist",
    level: "pro",
    imageId: "guide-pre-launch",
    content: `
        <p>This is your definitive checklist to follow before you launch your affiliate site to the world. Following these steps will ensure a smooth, professional launch.</p>
        
        <h3>Step 1: Finalize Your Production Keys</h3>
        <p>Your <code>.env</code> file holds the keys to your external services. Before launch, you must switch from testing (sandbox) keys to live (production) keys.</p>
        <ul>
            <li><strong>PayPal:</strong> Log in to your PayPal Developer Dashboard and get your <strong>Live</strong> credentials. Update the <code>PAYPAL_CLIENT_ID</code> and <code>PAYPAL_CLIENT_SECRET</code> in your <code>.env</code> file. Also ensure <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> matches your live client ID.</li>
            <li><strong>Gemini:</strong> Ensure you have your final, production-ready API key in the <code>.env</code> file for <code>GEMINI_API_KEY</code>.</li>
        </ul>

        <h3>Step 2: Connect Your Custom Domain</h3>
        <p>This is the most critical step. You need to point your domain (e.g., <code>hostproai.com</code>) to our cloud hosting servers.</p>
        <ol>
            <li><strong>Navigate to Firebase Hosting:</strong> Go to this specific URL for your project: <a href="https://console.firebase.google.com/project/affiliate-ai-host-new/hosting/custom-domains" target="_blank" rel="noopener noreferrer">Firebase Hosting Console</a>. Click "Add custom domain".</li>
            <li><strong>Verify Ownership (TXT Record):</strong> The Firebase wizard will ask you to verify you own the domain. It will provide a <strong>TXT record</strong> value. Copy this value. Go to your domain registrar (the website where you purchased your domain), find its DNS settings, and add a new TXT record for your main domain (the host is usually '@'). Paste the value from Firebase and save. Wait for Firebase to verify it, which can take up to an hour.</li>
            <li><strong>Go Live (A Records):</strong> After verification, Firebase will give you two <strong>A Records</strong> (IP addresses). Go back to your domain registrar's DNS settings. <strong>Delete any old A records</strong> for your root domain ('@') to prevent conflicts. Then, create two new A records, one for each IP address Firebase provided.</li>
        </ol>
        <p>Once these DNS changes propagate across the internet, your site will be live at your custom domain with a secure SSL certificate.</p>
        
        <h3>Step 3: Test Your Live Site</h3>
        <p>Once your domain is live, perform one final test.</p>
        <ul>
            <li>Open a new incognito browser window.</li>
            <li>Go to your live domain: <code>https://hostproai.com</code></li>
            <li>Sign up for the cheapest plan using a new email address and a real credit card or PayPal account. This ensures your payment gateway is working correctly in production.</li>
            <li>After the test, you can request a refund for the transaction.</li>
        </ul>

        <h3>Step 4 (Optional): Google Site Verification</h3>
        <p>To help Google index your site and track its performance, you can add a site verification tag.</p>
        <ul>
            <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">Google Search Console</a> and add your domain.</li>
            <li>Choose the "HTML tag" verification method.</li>
            <li>Copy the meta tag Google provides (e.g., <code>&lt;meta name="google-site-verification" content="..." /&gt;</code>).</li>
            <li>Paste this tag into the <code>&lt;head&gt;</code> section of the <code>src/app/layout.tsx</code> file in your project.</li>
        </ul>
    `
  },
  {
    title: "Pay-Per-Click (PPC) Advertising for Affiliates",
    level: "pro",
    imageId: "guide-ppc-ads",
    content: `
      <p>PPC platforms like Google Ads and Microsoft (Bing) Ads can drive immediate, targeted traffic. You pay only when someone clicks your ad. It's a powerful way to scale.</p>
      <strong>Getting Started with Google Ads:</strong>
      <ol>
        <li>Go to <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">ads.google.com</a> and create an account.</li>
        <li><strong>Keyword Research:</strong> Target 'long-tail' keywords. Instead of "web hosting", bid on "web hosting with daily affiliate payout". These are less competitive and convert better.</li>
        <li><strong>Ad Group Structure:</strong> Create separate ad groups for different themes (e.g., one for 'AI content tools', one for 'affiliate marketing hosting').</li>
        <li><strong>Send Traffic to a Review Page:</strong> Never send paid traffic directly to your affiliate link. Send it to your product review page on your blog or website. This warms up the visitor before they see the offer.</li>
      </ol>
      <strong>Sample Google Ad Copy:</strong>
      <blockquote>
        <p><strong>Headline 1:</strong> Earn 70% Daily Commissions<br/>
        <strong>Headline 2:</strong> AI-Powered Web Hosting<br/>
        <strong>Headline 3:</strong> Best Affiliate Program 2024<br/>
        <strong>Description:</strong> Stop waiting for monthly payouts. Join Affiliate AI Host and get paid daily via PayPal. Powerful AI tools and reliable hosting included. Sign up now!</p>
      </blockquote>
      <p><strong>Important:</strong> Start with a small daily budget (e.g., $5-$10) and carefully track your spending versus your commissions to ensure profitability.</p>
    `
  },
  {
    title: "Conversion Rate Optimization (CRO) Fundamentals",
    level: "pro",
    imageId: "guide-cro-fundamentals",
    content: `
      <p>CRO is the art of turning more of your website visitors into customers. A small tweak can lead to a big increase in sales.</p>
      <strong>Key Areas to Test (A/B Testing):</strong>
      <ul>
        <li><strong>Headlines:</strong> Test different emotional triggers. "Earn Daily Payouts" vs. "The Last Hosting You'll Ever Need".</li>
        <li><strong>Call-to-Action (CTA) Buttons:</strong> Test button text ("Get Started Now" vs. "Claim Your 70% Commission"), color (e.g., green vs. orange), and placement.</li>
        <li><strong>Page Layout:</strong> Try moving your testimonials higher up the page or simplifying your navigation.</li>
        <li><strong>Trust Signals:</strong> Add trust badges, security seals, or money-back guarantees near your CTA buttons.</li>
      </ul>
      <p>Use a tool like <a href="https://optimize.google.com" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">Google Optimize</a> (free) or <a href="https://vwo.com" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">VWO</a> to run these tests. Only change one element at a time to know what made the difference. Even a 1% increase in conversion rate can have a massive impact on your daily income.</p>
    `
  },
  {
    title: "Your 7-Day Automated Email Follow-up Sequence",
    level: "pro",
    imageId: "guide-email-sequence",
    content: `
        <p>This is your complete, 7-day email sequence, ready to use with any email marketing provider (like MailerLite, ConvertKit, etc.). This sequence is designed to build trust, demonstrate value, and guide your subscribers toward signing up.</p>

        <hr class="my-6 border-border" />

        <h3>Email 1: Welcome Email with Checklist (Sent Immediately)</h3>
        <p><strong>Subject:</strong> Your Free 24-Hour Launch Checklist is Here!</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hi there,</p>
            <p>Thank you for subscribing! I'm excited to share the checklist that can help you get a real, income-generating website up and running in just one day.</p>
            <p>Here is your exclusive guide: <strong>The 5-Step Checklist to Launching a Profitable Affiliate Website in 24 Hours.</strong></p>
            <p><em>(You can copy the content from the "5-Step Checklist" guide and paste it here)</em></p>
            <p>To your success,</p>
            <p>Grant Rizzoli</p>
        </blockquote>

        <hr class="my-6 border-border" />

        <h3>Email 2: The #1 Mistake New Affiliates Make (Send on Day 2)</h3>
        <p><strong>Subject:</strong> The #1 Mistake Nearly All New Affiliates Make</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hi there,</p>
            <p>Yesterday you received the 24-hour launch checklist. It’s designed to get you moving fast.</p>
            <p>But before you go any further, I want to share the biggest trap I see new affiliates fall into: <strong>They try to sell, instead of trying to help.</strong></p>
            <p>Your job as an affiliate isn't to be a pushy salesperson. It's to be a trusted guide. When you find a great tool that solves a real problem, your only job is to share it with people who have that problem.</p>
            <p>Affiliate AI Host solves three main problems for entrepreneurs: needing reliable hosting, creating content, and wanting a clear path to making money. When you recommend it, you're offering a complete solution.</p>
            <p>Focus on being helpful first, and the sales will naturally follow.</p>
            <p>To your success,</p>
            <p>Grant Rizzoli</p>
        </blockquote>

        <hr class="my-6 border-border" />

        <h3>Email 3: A Behind-the-Scenes Look (Send on Day 3)</h3>
        <p><strong>Subject:</strong> A quick look inside my affiliate command center</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hi,</p>
            <p>I’ve recommended Affiliate AI Host, but I wanted to show you *why* it's the engine behind my own affiliate business.</p>
            <p>It’s not just about the incredible 70-75% daily commissions. It’s about the tools that make earning them easier. My favorite feature is the <strong>AI Content Generator</strong>.</p>
            <p>If you want to see the platform and tools I use every day, you can check it out here:</p>
            <p><a href="https://hostproai.com/?ref=rentahost" target="_blank" rel="noopener noreferrer"><strong>https://hostproai.com/?ref=rentahost</strong></a></p>
            <p>It’s worth a look just to see how the platform is structured for affiliate success.</p>
            <p>Best,</p>
            <p>Grant Rizzoli</p>
        </blockquote>
        
        <hr class="my-6 border-border" />

        <h3>Email 4: Your First "Money-Making Asset" (Send on Day 4)</h3>
        <p><strong>Subject:</strong> Let's create your first money-making asset</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hey there,</p>
            <p>Let’s talk about creating an asset that can earn you money while you sleep: a <strong>product review blog post</strong>.</p>
            <p>One great review, ranked well on Google, can bring you sales for years. Here’s a simple template:
            <ul>
                <li><strong>Title:</strong> "Affiliate AI Host Review 2024: Is 70% Daily Commission Legit?"</li>
                <li><strong>Intro:</strong> Start with the biggest benefit – the daily payouts.</li>
                <li><strong>Why you love it:</strong> Talk about your favorite feature.</li>
                <li><strong>Call to Action:</strong> End with a strong recommendation and your link.</li>
            </ul>
            </p>
            <p>To post a review, you need a website. If you're ready to build your first real online asset, this is the platform I recommend to get it done fast:</p>
            <p><a href="https://hostproai.com/?ref=rentahost" target="_blank" rel="noopener noreferrer"><strong>https://hostproai.com/?ref=rentahost</strong></a></p>
            <p>Cheers,</p>
            <p>Grant Rizzoli</p>
        </blockquote>

        <hr class="my-6 border-border" />

        <h3>Email 5: Let's Do Some Quick Math (Send on Day 5)</h3>
        <p><strong>Subject:</strong> Can you spare 5 minutes? Let's talk numbers.</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hi,</p>
            <p>Let's break down the real power of this affiliate program. The "Pro" plan costs $49.95/day. Your commission is 70%. That's <strong>$34.96 per day... from a single referral.</strong></p>
            <p>Now, imagine you refer just <strong>5 people</strong> who choose that plan. That's over $5,200 a month, paid out to your PayPal account automatically, every single day.</p>
            <p>This isn't a get-rich-quick scheme. It's simple, powerful math.</p>
            <p>Want to start your own daily income stream? <a href="https://hostproai.com/?ref=rentahost" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline"><strong>Click here to see the plans and get started.</strong></a></p>
            <p>Best,</p>
            <p>Grant Rizzoli</p>
        </blockquote>

        <hr class="my-6 border-border" />

        <h3>Email 6: From Zero to Daily Payouts (Send on Day 6)</h3>
        <p><strong>Subject:</strong> How Sarah went from $0 to daily income</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hi there,</p>
            <p>I want to share a quick story about Sarah. She was new to affiliate marketing and frustrated with slow, monthly payouts. She signed up for Affiliate AI Host, paid her one-time activation fee, and got to work.</p>
            <p>She used the AI tools to write a few posts and promote them. Within a week, she got her first two referrals. After their trial, she saw her first commission in her PayPal. Then another the next day. And the next.</p>
            <p>That daily motivation is powerful. You can follow the exact same path. It all starts with the right platform. <a href="https://hostproai.com/?ref=rentahost" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline"><strong>Get the same tools Sarah used right here.</strong></a></p>
            <p>Talk soon,</p>
            <p>Grant Rizzoli</p>
        </blockquote>
        
        <hr class="my-6 border-border" />

        <h3>Email 7: Is this goodbye? (Send on Day 7)</h3>
        <p><strong>Subject:</strong> Final call: Your risk-free chance to start</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hi,</p>
            <p>It’s been about a week since you downloaded the launch checklist. If you haven't started yet, what's holding you back?</p>
            <p>Maybe you're worried it's not for you. That's why there's a <strong>24-hour, no-questions-asked refund policy</strong> on the one-time activation fee. You can try it with zero risk.</p>
            <p>The opportunity to build a daily income stream is right in front of you. The best time to start was yesterday. The second-best time is now.</p>
            <p><a href="https://hostproai.com/?ref=rentahost" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline"><strong>Click Here to Create Your Account & Launch Your Affiliate Business Today.</strong></a></p>
            <p>This is your moment. Don't let it pass you by.</p>
            <p>To your success,</p>
            <p>Grant Rizzoli</p>
        </blockquote>
    `
  },
  {
    title: "Developing Strategic Partnerships & Joint Ventures",
    level: "enterprise",
    imageId: "guide-partnerships",
    content: `
      <p>At this level, you scale by leveraging other people's audiences. This is the fastest way to explosive growth.</p>
      <strong>Finding Partners:</strong>
      <ul>
        <li>Identify influencers, bloggers, and course creators in the 'make money online', 'digital marketing', and 'web development' niches.</li>
        <li>Look for people who have an engaged email list or YouTube channel but are NOT currently promoting a direct competitor.</li>
      </ul>
      <strong>The Pitch (Don't use your affiliate link here):</strong>
      <ol>
        <li><strong>Build a Relationship:</strong> Interact with their content for a few weeks before reaching out.</li>
        <li><strong>Craft the Offer:</strong> Email them with a proposal. Don't just ask them to promote your link. Offer a true partnership.
          <blockquote><em>"Hi [Name], I'm a top affiliate for a new platform called Affiliate AI Host that's converting really well. I think your audience would love it. Would you be open to a joint venture? We could host a webinar together where you teach [Their Expertise] and I show how the tools can help. We can split the commissions from any sales generated."</em></blockquote>
        </li>
        <li><strong>Provide a Custom Bonus:</strong> Offer to create an exclusive bonus (e.g., a special report, a short video course) that is only available to people who buy through their link. This makes their offer unique and more valuable.</li>
      </ol>
      <p>A single successful joint venture can bring in hundreds of sales at once, far more than you could achieve alone.</p>
    `
  }
];
