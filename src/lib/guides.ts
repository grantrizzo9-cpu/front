

export type Guide = {
  title: string;
  level: 'starter' | 'plus' | 'pro' | 'business' | 'scale' | 'enterprise';
  content: string;
};

export const allGuides: Guide[] = [
  // Starter Guides
  {
    title: "Understanding Your Affiliate Link & Dashboard",
    level: "starter",
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
    title: "Social Media Marketing 101: Your First Ads",
    level: "starter",
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
    content: `
      <p>An email list is a direct line to your audience and one of your most valuable assets. Unlike social media, you OWN your list.</p>
      <p>We recommend using a service like <strong>MailerLite</strong>. They offer a great free plan and are very easy to use. To connect your website to MailerLite, you will need an API key.</p>
      <p><strong>Please see our guide titled "Email Marketing with MailerLite" for detailed instructions on how to find your API key.</strong></p>
      <strong>General Steps to Start Your List:</strong>
      <ol>
          <li><strong>Choose a Service:</strong> Start with <a href="https://www.mailerlite.com/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">MailerLite</a>.</li>
          <li><strong>Create a 'Lead Magnet':</strong> Offer something valuable for free in exchange for an email. Examples: a simple checklist ("5 Things Your New Website Needs") or a short PDF guide.</li>
          <li><strong>Add a Sign-up Form:</strong> Put a form on your website or blog offering your lead magnet.</li>
          <li><strong>Nurture Your List:</strong> Send a welcome email, followed by a mix of helpful content and promotional emails. A good ratio is 3 helpful emails for every 1 promotional email.</li>
      </ol>
      <p>In your promotional emails, share the benefits of Affiliate AI Host and include your affiliate link.</p>
    `
  },
  {
    title: "Email Marketing with MailerLite",
    level: "plus",
    content: `
      <p>MailerLite is a powerful yet user-friendly email marketing service that's perfect for affiliates. This guide will show you how to get your API key, which you'll need to connect your website to your MailerLite account for features like automated newsletter sign-ups.</p>
      <h3>How to Find Your MailerLite API Key</h3>
      <p>Follow these simple steps to locate your API key:</p>
      <ol>
          <li>Log in to your <a href="https://dashboard.mailerlite.com" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">MailerLite dashboard</a>.</li>
          <li>In the left-hand navigation menu, click on <strong>Integrations</strong>.</li>
          <li>On the Integrations page, find the <strong>Developer API</strong> section and click the <strong>Use</strong> button.</li>
          <li>Your API key will be displayed on the next screen. You can click the <strong>Copy</strong> button to copy it to your clipboard.</li>
      </ol>
      <h3>Securing Your API Key</h3>
      <p>Your API key is secret and should be treated like a password. The best practice is to store it in an environment variable file (like a <code>.env</code> file) in your project, for example:</p>
      <code>MAILERLITE_API_KEY=your_api_key_here</code>
      <p>This allows your application to use the key securely without exposing it in your code.</p>
    `
  },

  // Pro Guides
  {
    title: "Your Pre-Launch Checklist",
    level: "pro",
    content: `
        <p>This is your definitive checklist to follow before you launch your affiliate site to the world. Following these steps will ensure a smooth, professional launch.</p>
        
        <h3>Step 1: Finalize Your Production Keys</h3>
        <p>Your <code>.env</code> file holds the keys to your external services. Before launch, you must switch from testing (sandbox) keys to live (production) keys.</p>
        <ul>
            <li><strong>PayPal:</strong> Log in to your PayPal Developer Dashboard and get your <strong>Live</strong> credentials. Update the <code>PAYPAL_CLIENT_ID</code> and <code>PAYPAL_CLIENT_SECRET</code> in your <code>.env</code> file. Also ensure <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> matches your live client ID.</li>
            <li><strong>MailerLite & Gemini:</strong> Ensure you have your final, production-ready API keys in the <code>.env</code> file for <code>MAILERLITE_API_KEY</code>, <code>MAILERLITE_GROUP_ID</code>, and <code>GEMINI_API_KEY</code>.</li>
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

  // Enterprise Guide
  {
    title: "Developing Strategic Partnerships & Joint Ventures",
    level: "enterprise",
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
