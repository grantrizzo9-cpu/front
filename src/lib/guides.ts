
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
    content: "Your affiliate link is your unique identifier. Every time someone clicks it and makes a purchase, you get credit. Your dashboard is your command center for tracking clicks, referrals, and earnings. Familiarize yourself with it to monitor your success."
  },
  {
    title: "Social Media Marketing 101: Sharing Your Link",
    level: "starter",
    content: "Start by sharing your affiliate link on your personal social media profiles. Write a genuine post about why you're recommending our service. Don't just spam the link; provide context and value to your followers. Consistency is key."
  },
  {
    title: "Beginner's Guide to SEO for Your Affiliate Site",
    level: "starter",
    content: "Search Engine Optimization (SEO) helps people find your website on Google. Start by identifying keywords related to our service (e.g., 'best AI web hosting'). Write blog posts or create pages using these keywords in your titles and content to attract organic traffic."
  },
  
  // Plus Guides
  {
    title: "Content is King: Writing Compelling Product Reviews",
    level: "plus",
    content: "A detailed, honest product review is one of the most powerful affiliate marketing tools. Go beyond the feature list. Talk about your personal experience, the pros and cons, and who would benefit most from the service. Use screenshots and be authentic."
  },
  {
    title: "Email Marketing Basics: Building Your First List",
    level: "plus",
    content: "An email list is a direct line to your audience. Offer a freebie (like a small ebook or checklist) in exchange for an email address. Then, you can send them valuable content and occasional promotions for our service, including your affiliate link."
  },
  {
    title: "Analyzing Your Traffic: Introduction to Web Analytics",
    level: "plus",
    content: "Use free tools like Google Analytics to understand where your website visitors are coming from (e.g., Google, social media) and which pages are most popular. This data helps you focus your efforts on what's working."
  },

  // Pro Guides
  {
    title: "Advanced SEO: Link Building & Keyword Strategy",
    level: "pro",
    content: "Deepen your SEO knowledge. Learn how to get other websites to link back to yours (backlinks), which boosts your authority in Google's eyes. Use tools like Ahrefs or SEMrush to find high-value keywords that your competitors might be missing."
  },
  {
    title: "Pay-Per-Click (PPC) Advertising for Affiliates",
    level: "pro",
    content: "PPC platforms like Google Ads and Facebook Ads can drive immediate traffic. Learn how to create targeted ad campaigns that send potential customers to your review pages or directly through your affiliate link. Start with a small budget and track your return on investment (ROI) carefully."
  },
  {
    title: "Conversion Rate Optimization (CRO) Fundamentals",
    level: "pro",
    content: "CRO is the science of turning more of your visitors into customers. Experiment with different headlines, button colors ('A/B testing'), and page layouts to see what encourages more people to click your affiliate link and make a purchase."
  },

  // Business Guides
  {
    title: "Scaling Your Campaigns: A/B Testing & Funnel Optimization",
    level: "business",
    content: "Go beyond simple A/B tests. Build entire marketing funnels, from the initial ad or blog post to the final sale. Use advanced analytics to identify drop-off points and optimize each step of the customer journey for maximum conversions."
  },
  {
    title: "Building a Brand: Beyond Just an Affiliate Site",
    level: "business",
    content: "Transition from being just an affiliate to a recognized brand in your niche. Develop a unique voice, a professional design, and a consistent presence across multiple platforms. A strong brand builds trust and long-term loyalty."
  },

  // Scale Guides
  {
    title: "Outsourcing & Automation for Your Affiliate Business",
    level: "scale",
    content: "You can't do it all yourself. Learn how to hire freelance writers, virtual assistants, and SEO specialists to scale your content production and marketing efforts. Use automation tools to handle repetitive tasks so you can focus on strategy."
  },

  // Enterprise Guides
  {
    title: "Developing Strategic Partnerships & Joint Ventures",
    level: "enterprise",
    content: "Collaborate with other major players in your industry. Co-author content, host joint webinars, or create unique bonus packages for each other's audiences. Strategic partnerships can unlock massive new traffic sources and revenue streams."
  }
];
