
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookOpen, Download } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { User as UserType } from '@/lib/types';
import { doc } from 'firebase/firestore';


export type Guide = {
  title: string;
  level: 'starter' | 'plus' | 'pro' | 'business' | 'scale' | 'enterprise';
  content: string;
  imageId: string;
};

// All guide data is now self-contained within this component.
const allGuides: Guide[] = [
  {
    title: "The 5-Step Checklist to Launching a Profitable Affiliate Website in 24 Hours",
    level: "starter",
    imageId: "guide-checklist-launch",
    content: `
        <p>Welcome to your rapid-launch plan. This exclusive checklist is engineered to take you from zero to a live, income-ready affiliate website in a single day. The goal is momentum. By following these five steps, you will build a solid foundation for your affiliate business and be positioned to earn from day one. Let's begin.</p>

        <h3>Step 1: Define Your Niche & Secure Your Domain (First 4 Hours)</h3>
        <p>This is the most strategic part of the process. A great domain name is your brand, and your niche is your battleground. Choose wisely.</p>
        <ul>
            <li><strong>Niche Selection:</strong> Your primary product is Affiliate AI Host, which appeals to entrepreneurs, marketers, developers, and anyone wanting to start an online business. Your niche could be a subset of this. For example: "AI tools for small business owners," "passive income strategies for students," or "the best hosting for new bloggers." A tighter niche is easier to dominate. Think about who you can best speak to.</li>
            <li><strong>Domain Brainstorming:</strong> List at least 20 potential domain names. Combine keywords related to your niche with action words or branding. Examples: <code>AIEmpireBuilders.com</code>, <code>PassiveIncomePlaybook.net</code>, <code>YourNameAI.com</code>.</li>
            <li><strong>Check Availability:</strong> Use the domain search tool on your <strong>Hosting page</strong> to find available domains through your integrated reseller store. This is a crucial step. Do not get attached to a name until you know it's available.</li>
            <li><strong>Domain Best Practices:</strong>
                <ul>
                    <li><strong>.com is King:</strong> Always prioritize a .com extension. It carries the most authority and trust.</li>
                    <li><strong>Keep it Short & Memorable:</strong> If you can't say it and have someone spell it correctly, it's too complicated.</li>
                    <li><strong>Avoid Hyphens and Numbers:</strong> These can look unprofessional and are hard to communicate verbally.</li>
                </ul>
            </li>
            <li><strong>Final Decision & Purchase:</strong> <a href="https://rizzosai.shopco.com/" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline">Purchase your chosen domain</a>. Congratulations, you now own a piece of digital real estate. This is the foundation of your online brand.</li>
        </ul>

        <h3>Step 2: Connect Your Domain & Go Live (Next 2 Hours)</h3>
        <p>This is a technical but critical step. You're pointing your new domain name to our powerful hosting infrastructure. It's what makes your site appear online.</p>
        <ul>
            <li><strong>Follow the Guide:</strong> Don't guess. We have a detailed, step-by-step guide specifically for this process. Open the <strong>"Your First Affiliate Website"</strong> guide from your dashboard now. It will walk you through finding your DNS settings at your registrar and adding the required 'A records' to point your domain to your host.</li>
            <li><strong>Initiate Connection:</strong> Following the guide, update your DNS records. This process is not instantaneous; it can take anywhere from 30 minutes to a few hours to propagate across the internet. While you wait, you can proceed to the next step.</li>
        </ul>

        <h3>Step 3: Create Your Core "Money" Pages (Next 10 Hours)</h3>
        <p>Content is what attracts visitors and converts them into customers. To launch, you need two essential pages: a trust-building 'About' page and a conversion-focused 'Review' page.</p>
        <ul>
            <li><strong>'About Me' Page:</strong> This page sells YOU. Be authentic. Who are you? Why did you start this journey? Why do you believe in this product? Share a photo. People buy from people they know, like, and trust. Write at least 400 words.</li>
            <li><strong>The "Money" Page - Your In-Depth Review:</strong> This is your primary sales tool. It must be detailed, honest, and compelling. Refer to our <strong>"Content is King: Writing Compelling Product Reviews"</strong> guide for a full-length template and strategy. Your review should cover:
                <ul>
                    <li>An attention-grabbing headline.</li>
                    <li>A personal story about why you chose Affiliate AI Host.</li>
                    <li>A detailed breakdown of the key features (daily pay, high commission, AI tools).</li>
                    <li>Screenshots of the dashboard and tools in action.</li>
                    <li>A clear explanation of the pricing and the value proposition.</li>
                    <li>An honest look at the pros and cons to build credibility.</li>
                    <li>Multiple, clear call-to-action buttons with your affiliate link.</li>
                </ul>
            This page should be a minimum of 1500 words to establish authority with search engines and readers.
            </li>
        </ul>

        <h3>Step 4: Your First Promotional Blitz (Next 6 Hours)</h3>
        <p>A beautiful website with no traffic is a billboard in the desert. It's time to generate your first wave of visitors.</p>
        <ul>
            <li><strong>Social Media Launch:</strong> Use the templates from our <strong>"Social Media Marketing 101"</strong> guide to craft posts for Facebook, X/Twitter, and LinkedIn. Announce your new site and share a link to your review page. Don't just post a link; tell a story.</li>
            <li><strong>Community Engagement:</strong> Find 3-5 online communities where your target audience congregates (e.g., Reddit's r/affiliatemarketing, Facebook groups for entrepreneurs). <strong>Do not spam your link.</strong> Spend an hour in each group answering questions and providing value. Then, and only then, write a post sharing your experience and linking to your review. "I wrote a detailed review of my experience with a new AI hosting platform that pays daily, hope it's helpful for you guys."</li>
            <li><strong>Personal Outreach:</strong> Send a personal message (email or DM) to 10 friends, colleagues, or contacts who you genuinely believe could benefit from this. Explain what it is and why you thought of them. A personal recommendation is incredibly powerful.</li>
        </ul>

        <h3>Step 5: Review, Track, & Optimize (Final 2 Hours)</h3>
        <p>Before you rest, check your work and set up your systems for tracking success.</p>
        <ul>
            <li><strong>The Link Audit:</strong> Meticulously click every single link on your website. Your navigation links, your in-text links, and especially every affiliate link. Use an incognito browser to ensure your affiliate code (`?ref=...`) is correctly appended to the URL. A broken money link means zero income.</li>
            <li><strong>Monitor Your Dashboard:</strong> Keep your Affiliate AI Host dashboard open. As clicks come in and referrals sign up, you'll see them appear in real-time. This is your command center.</li>
            <li><strong>Celebrate Your Launch:</strong> You have done what 99% of aspiring entrepreneurs only talk about. You've launched a real online business in 24 hours. This is a major accomplishment.</li>
        </ul>
    `
  },
  {
    title: "Understanding Your Affiliate Link & Dashboard",
    level: "starter",
    imageId: "guide-dashboard-link",
    content: `
        <p>Welcome to the engine room of your affiliate business. This guide will give you a comprehensive understanding of your two most critical assets: your unique affiliate link and your performance dashboard. Mastering these tools is the first and most important step on your path to earning.</p>
        
        <h3>Part 1: Your Affiliate Link - The Golden Key</h3>
        <p>Your affiliate link is your personal tracking code. It's the mechanism that ensures you get credit for every single customer you send our way. It's absolutely vital that you understand how it works and how to use it correctly.</p>
        <p>Your link will always follow this format: <a href="[YOUR_AFFILIATE_LINK_HERE]" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline"><code>[YOUR_AFFILIATE_LINK_HERE]</code></a></p>
        
        <h4>How Tracking Works: The Cookie</h4>
        <p>When a person clicks on your unique link, a small text file called a "cookie" is placed in their web browser. This cookie contains your unique affiliate ID. It acts as a digital name tag.</p>
        <ul>
            <li><strong>Lifetime Association:</strong> Our program uses a "lifetime" cookie policy. This means that from the moment they click your link, that customer is permanently associated with your affiliate account.</li>
            <li><strong>Delayed Purchase Protection:</strong> Even if they don't sign up immediately—if they come back a day, a week, or even six months later—as long as they are using the same browser and haven't cleared their cookies, the sale will be credited to you. This is a massive advantage over programs with short cookie durations.</li>
            <li><strong>Where to Find Your Link:</strong> Your unique affiliate link is prominently displayed on your <a href="/dashboard/settings" class="text-primary hover:underline">Settings</a> page. Copy it from there to ensure you have the exact, correct version.</li>
        </ul>

        <h4>The Cardinal Rules of Link Usage:</h4>
        <ol>
            <li><strong>Never Alter The Link:</strong> Do not use URL shorteners or attempt to modify the link in any way. Doing so can break the tracking mechanism, and you will lose commissions. Always use the full, complete link as provided.</li>
            <li><strong>Use it Contextually:</strong> Don't just drop your link randomly. Place it where it makes sense: within a product review, on a "recommended tools" page, or as a call-to-action in a relevant social media post. Context increases trust and click-through rates.</li>
            <li><strong>Check Your Link:</strong> After placing your link on your website or in a post, click it yourself using an incognito browser window. Verify that it takes you to the correct page and that your ` + '`?ref=...`' + ` code is visible in the address bar.</li>
        </ol>

        <hr class="my-6 border-border" />

        <h3>Part 2: Your Dashboard - The Command Center</h3>
        <p>Your <a href="/dashboard" class="text-primary hover:underline">Dashboard</a> provides a real-time, transparent view of your affiliate performance. It's designed to give you all the data you need to make informed decisions and track your growth. Let's break down the key components:</p>
        
        <h4>Key Performance Indicators (KPIs):</h4>
        <ul>
            <li><strong>Total Earnings:</strong> This is your cumulative commission from all recurring sales since you started. It's your lifetime report card. Note that this does not include the initial one-time activation fees paid by your referrals, as those go to the platform owner.</li>
            <li><strong>Total Referrals:</strong> This is the total number of individual users who have signed up through your affiliate link, regardless of their current status. This number is a key indicator of your marketing reach.</li>
            <li><strong>Unpaid Commissions:</strong> This is the amount you are scheduled to receive in the next daily payout cycle. This number reflects the commissions earned from your referrals' recurring subscription payments in the last 24 hours.</li>
            <li><strong>Storage Usage:</strong> This shows how much storage you are currently using based on the plan you're subscribed to. It helps you manage your own account resources effectively.</li>
        </ul>

        <h4>The Referrals Table: Your Activity Feed</h4>
        <p>This table provides a granular look at your recent sign-ups. Understanding the statuses is crucial:</p>
        <ul>
            <li><strong>Referred User:</strong> The username of the person who signed up.</li>
            <li><strong>Plan:</strong> The specific subscription tier they chose.</li>
            <li><strong>Activation Status:</strong>
                <ul>
                    <li><strong>Pending:</strong> This means the user has created an account through your link but has NOT yet paid their one-time activation fee. They are in the system and linked to you, but have not yet started their trial.</li>
                    <li><strong>Activated:</strong> This user has paid the activation fee and their 3-day trial has begun. This is a successful conversion! You will start earning commission on their daily payments *after* their trial period ends.</li>
                </ul>
            </li>
            <li><strong>Date:</strong> The timestamp of when the user first signed up.</li>
        </ul>
        <p><strong>Your Mission:</strong> Your primary goal is to get your unique affiliate link in front of the right people. Every other guide in this library is dedicated to teaching you the most effective strategies to do exactly that. Check your dashboard daily to see the results of your efforts and stay motivated by your progress.
        </p>
    `
  },
  {
    title: "Your First Affiliate Website: A Step-by-Step Guide for Beginners",
    level: "starter",
    imageId: "guide-website-forwarding",
    content: `
      <p>Welcome to the most important guide for establishing a professional online presence. In the past, affiliates might have used a simple trick called "domain forwarding" to redirect a domain to their affiliate link. However, this method is outdated and heavily penalized by search engines like Google. It signals a low-quality site and will harm your ability to get organic traffic. This guide will show you the modern, professional, and SEO-friendly way to set up your affiliate website.</p>
      
      <h3>The Big Idea: Your Domain, Our Hosting, Your Brand</h3>
      <p>The concept is simple but powerful. You will register your own unique domain name (e.g., <code>www.lizs-ai-reviews.com</code>). Then, instead of a cheap redirect, you will correctly point that domain to our high-performance Google Cloud hosting infrastructure. This tells the internet that your domain is the home of a real, legitimate website.</p>
      <p><strong>The Result:</strong> When you share your domain, visitors arrive at a fast, professional, and secure website. You maintain all the branding and SEO benefits of owning your domain, while leveraging the power and reliability of our platform. This is how successful online businesses are built.</p>
      
      <hr class="my-6 border-border" />
      
      <h3>Step 1: Find Your "Golden Key" (Your Affiliate Link)</h3>
      <p>While you won't be forwarding to this link, you still need it for all your other marketing efforts (social media, emails, etc.). It's the unique code that tracks your sales.</p>
      <ol>
        <li>Navigate to your <a href="/dashboard/settings" target="_blank" class="text-primary font-semibold hover:underline">Affiliate Settings Page</a>.</li>
        <li>Carefully copy your complete, unique affiliate link. It will look exactly like this: <a href="[YOUR_AFFILIATE_LINK_HERE]" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline"><code>[YOUR_AFFILIATE_LINK_HERE]</code></a>.</li>
        <li>Save this link in a secure text file. You will use this link everywhere *except* for your main domain connection.</li>
      </ol>
      
      <h3>Step 2: Purchase Your Digital Real Estate (Your Domain Name)</h3>
      <p>Your domain name is your brand. It's how people will remember and find you. A professional domain is a non-negotiable part of building a long-term, sustainable business.</p>
      <ol>
        <li>Go to your <a href="https://rizzosai.shopco.com/" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline">integrated reseller store</a>. You can also use the convenient search tool on your <a href="/dashboard/hosting" target="_blank" class="text-primary font-semibold hover:underline">Hosting Page</a>.</li>
        <li>Brainstorm and search for a domain that is relevant to your niche. Try combining keywords like 'AI', 'hosting', 'reviews', 'insider', 'hub', 'stack', or your own name.</li>
        <li>Select a <code>.com</code> extension if at all possible. It holds the most trust and authority online.</li>
        <li>Complete the purchase. For a small annual fee, you now own that domain. This is a critical business asset.</li>
      </ol>
      
      <h3>Step 3: The Professional Connection (DNS A Records)</h3>
      <p>This is where we leave the amateur methods behind. You will now connect your domain to your host using DNS (Domain Name System) records. This is the industry-standard method that tells the entire internet where your website's files are located.</p>
      <p>The instructions for this process are detailed in the <strong>"Pre-Launch Checklist"</strong> guide. We have created a dedicated, technical guide to ensure you do this step perfectly. Open that guide now from your dashboard.</p>
      <p>Here is a simplified overview of what you'll be doing:</p>
      <ol>
        <li>You will log in to your hosting console (a link is provided in the Pre-Launch Checklist).</li>
        <li>You will add your custom domain, and the system will provide you with specific values for DNS records, primarily two **"A Records"**. These are IP addresses that point to the Google Cloud servers where your site lives.</li>
        <li>You will then log in to your domain registrar (where you bought your domain in Step 2).</li>
        <li>Navigate to the DNS management section for your domain.</li>
        <li>You will **delete any old or existing A records** to avoid conflicts.</li>
        <li>You will then create **two new A records**, pasting in the IP address values provided by the hosting console.</li>
      </ol>
      
      <hr class="my-6 border-border" />
      
      <h3>You're Done! What Happens Now?</h3>
      <p>The process of DNS "propagation" can take anywhere from a few minutes to a few hours. This is the time it takes for the new "address" of your website to be updated across the global internet.</p>
      <p>Once it's complete, you can type your new domain (e.g., <code>www.lizs-ai-reviews.com</code>) into any browser. You will be taken directly to your professional website, hosted on our platform, with a secure SSL certificate automatically applied. You will see your domain in the address bar—no redirects, no forwarding. This tells Google and your visitors that you are a serious, authoritative presence online.</p>
      <p>Congratulations! You now have a professionally configured affiliate website, ready to be promoted and optimized for search engines.</p>
    `
  },
  {
    title: "Social Media Marketing 101: Your First Ads",
    level: "starter",
    imageId: "guide-social-media",
    content: `
        <p>Social media is one of the most effective channels for driving immediate traffic to your affiliate offers. However, success isn't about spamming your link; it's about providing value and building curiosity within a community. This guide will provide you with copy-paste templates and the strategy behind them to launch your first effective social media campaign.</p>
        
        <h3>The Core Strategy: Value First, Link Second</h3>
        <p>People on social media are not there to be sold to; they are there to connect, learn, and be entertained. Your content must respect that. The goal is to warm up your audience before you ever present a link. Always aim to send traffic to your high-value content (like your product review page), not directly to the affiliate signup page.</p>

        <h3>Template for Facebook / LinkedIn (Long-Form, Value-Driven)</h3>
        <p>These platforms are ideal for more detailed, story-driven posts.</p>
        <blockquote>
            <p>I've spent the last few weeks deep-diving into the world of online side-hustles, and I've been consistently disappointed by affiliate programs with low, monthly payouts. It feels like you're doing all the work for a tiny slice of the pie.</p>
            <p>That's why I was so intrigued when I stumbled upon a platform called Affiliate AI Host. Their model is radically different. They offer a massive 70% commission, but the real game-changer is that they pay out *daily* via PayPal. Seeing that first daily payment, no matter how small, is an incredible motivator.</p>
            <p>The product itself is a powerful combination of high-speed web hosting and a suite of AI content creation tools, which makes it a genuinely useful service for anyone looking to build an online presence. It's not just another affiliate scheme; it's a legitimate business-in-a-box.</p>
            <p>I wrote a full, in-depth review of my experience, breaking down the pros and cons, and who I think it's best for. If you're tired of the traditional affiliate grind, I highly recommend giving it a read.</p>
            <p>You can read my full review here: [YOUR_AFFILIATE_LINK_HERE]</p>
            <p>#webhosting #aicontent #affiliatemarketing #sidehustle #entrepreneurship #passivincome</p>
        </blockquote>

        <h3>Template for X (Twitter) (Short-Form, Punchy)</h3>
        <p>X requires you to be concise and impactful. Focus on the most powerful benefit.</p>
        <blockquote>
            <p>I just found a hosting platform that pays its affiliates 70% commissions DAILY via PayPal. This is not a drill. 🤯</p>
            <p>Affiliate AI Host bundles hosting with AI content tools. It's a super easy offer for anyone wanting to build a website or start an online business. The product sells itself.</p>
            <p>I wrote a breakdown of how it works. Worth a look if you're in the affiliate space 👇<br>[YOUR_AFFILIATE_LINK_HERE]</p>
            <p>#affiliatemarketing #saas #mrr #webdev</p>
        </blockquote>

        <h3>Instagram & TikTok Strategy (Visual & "Link in Bio")</h3>
        <p>These platforms don't allow clickable links in posts. The strategy is to use visual content to drive traffic to the single link in your profile.</p>
        <ol>
          <li><strong>Update Your Bio:</strong> Your bio should clearly state what you do and have a strong call to action. Example: "Helping you build daily income streams with AI | 🚀 My #1 Recommended Tool 👇". Your bio link should be your custom domain.</li>
          <li><strong>Create a Reel/TikTok:</strong> Create a short video. It could be a screen recording of your first daily payout hitting your PayPal, a quick tutorial on one of the AI tools, or you talking to the camera about the affiliate marketing model.</li>
          <li><strong>Video Content:</strong> Use on-screen text like "How I Earn Money While I Sleep" or "The Affiliate Program That Pays You Daily". End the video with a clear call to action: "Full details on the tool I use at the link in my bio!".</li>
          <li><strong>Post Description:</strong> Your description should elaborate on the video and, again, direct people to your bio link.</li>
        </ol>

        <h3>Where to Post & Best Practices:</h3>
        <ul>
            <li><strong>Your Personal Profile:</strong> The first and easiest place to start.</li>
            <li><strong>Relevant Facebook Groups:</strong> Search for groups related to "affiliate marketing," "digital nomads," "small business owners," etc. Read the group rules carefully. Many don't allow self-promotion. If they do, use the value-first approach.</li>
            <li><strong>LinkedIn Articles:</strong> Repurpose your full product review as a LinkedIn article to reach a professional audience.</li>
            <li><strong>Reddit:</strong> Subreddits like r/sidehustle, r/entrepreneur, and r/affiliatemarketing can be goldmines, but they are also very hostile to spam. You MUST provide value and engage in discussions genuinely before ever sharing a link.</li>
        </ul>
        <p><strong>Final Pro Tip:</strong> Consistency is more important than intensity. A few well-crafted posts per week are better than ten spammy posts in one day. Track which platforms drive the most clicks from your audience and double down on what works.</p>
    `
  },
  {
    title: "Content is King: Writing Compelling Product Reviews",
    level: "plus",
    imageId: "guide-content-writing",
    content: `
        <p>In affiliate marketing, a high-quality product review is your most powerful and enduring asset. It's your 24/7 salesperson, working tirelessly to convert visitors into commissions. A lazy, generic review will fail. But a detailed, authentic, and strategic review can generate passive income for years. This guide will provide you with a comprehensive, professional framework for writing a review that not only ranks on Google but also builds trust and drives action.</p>
        
        <h3>The Psychology of a Great Review</h3>
        <p>Before writing a single word, understand your goal. You are not just listing features. You are guiding the reader through a decision-making process. A great review accomplishes four things:</p>
        <ol>
            <li><strong>Builds Trust:</strong> It shows you are a real user with genuine experience.</li>
            <li><strong>Educates the Reader:</strong> It explains what the product does and for whom it is intended.</li>
            <li><strong>Handles Objections:</strong> It preemptively answers the questions and doubts the reader might have.</li>
            <li><strong>Creates Desire:</strong> It clearly articulates the benefits and paints a picture of a better future for the user.</li>
        </ol>

        <hr class="my-6 border-border" />

        <h3>The Ultimate Product Review Structure (1500+ Words)</h3>
        <p>Follow this structure for a comprehensive and effective review. Each section should flow logically into the next.</p>
        
        <h4><strong>1. The Headline: Your First Impression</strong></h4>
        <p>Your headline must be attention-grabbing and keyword-rich. It should promise a solution or an inside look. Don't be boring.</p>
        <ul>
            <li><strong>Formula:</strong> [Product Name] Review [Year]: [Intriguing Question or Bold Claim]?</li>
            <li><strong>Good Example:</strong> "Affiliate AI Host Review 2024: Is 70% Daily Commission Actually Legit?"</li>
            <li><strong>Bad Example:</strong> "My Review of Affiliate AI Host"</li>
        </ul>

        <h4><strong>2. The Introduction: The Hook and the Promise</strong></h4>
        <p>The first 100 words are critical. Hook the reader with a personal story or a relatable problem, then promise them a solution by the end of the review.</p>
        <blockquote><em>"I’d been in the affiliate game for three years, and I was sick of waiting 60-90 days for a payout. It felt like my cash was being held hostage. Then I found a platform that promised daily payouts, and I was skeptical. In this review, I'm going to break down my experience with Affiliate AI Host and reveal whether their promise of 70% daily commissions holds up under scrutiny."</em></blockquote>

        <h4><strong>3. The "What Is It?" Section: A Clear Overview</strong></h4>
        <p>Assume the reader has never heard of the product. In simple terms, explain what Affiliate AI Host is. Avoid jargon.</p>
        <blockquote><em>"Affiliate AI Host is a unique, all-in-one platform designed for affiliates and online entrepreneurs. It combines two core components: high-performance web hosting and a suite of artificial intelligence tools for content creation. The goal is to provide everything you need to build and market an online business, all while offering a powerful affiliate program."</em></blockquote>
        
        <h4><strong>4. The "Who Is It For?" Section: Targeting Your Audience</strong></h4>
        <p>This section builds rapport. By defining who will benefit most, you make qualified readers feel understood.</p>
        <ul>
            <li>Aspiring affiliate marketers tired of low, slow commissions.</li>
            <li>Bloggers and content creators who need reliable hosting and help with content ideas.</li>
            <li>Entrepreneurs looking for a "business-in-a-box" to start an online venture.</li>
            <li>Digital agencies who want to offer hosting and AI tools to their clients.</li>
        </ul>

        <h4><strong>5. The Deep Dive: Key Features & Benefits (The Core of the Review)</strong></h4>
        <p>This is where you go into detail. For each feature, explain what it is (the feature) and what it does for the user (the benefit).</p>
        <ul>
            <li><strong>Feature: 70-75% Commissions.</strong> Benefit: Industry-leading payout that allows you to build a substantial income stream faster than with any other program.</li>
            <li><strong>Feature: Daily PayPal Payouts.</strong> Benefit: Unprecedented cash flow. Get paid for your work the very next day, allowing you to reinvest or cover expenses without waiting months.</li>
            <li><strong>Feature: AI Content Suite.</strong> Benefit: Overcome writer's block and save dozens of hours per month by generating blog post ideas, social media updates, and ad copy instantly.</li>
            <li><strong>Use Screenshots:</strong> Visually show the dashboard, the AI tools, and the affiliate stats page. Visual proof is incredibly persuasive.</li>
        </ul>

        <h4><strong>6. The "Honest Assessment": Pros and Cons</strong></h4>
        <p>This is the most important section for building trust. No product is perfect. By acknowledging the downsides, you prove your review is unbiased and credible.</p>
        <ul>
            <li><strong>Pros:</strong> List all the major benefits (Daily pay, high commission, great tools, etc.).</li>
            <li><strong>Cons:</strong> Be honest but fair. A 'con' could be: "The platform is relatively new, so the community is still growing," or "The advanced AI tools are only available on higher-tier plans."</li>
        </ul>

        <h4><strong>7. Pricing Breakdown: Is It Worth The Investment?</strong></h4>
        <p>Clearly lay out the different subscription tiers. Don't just list the prices. Explain the value proposition of each tier. Who is the "Pro" plan for versus the "Starter" plan? Help the reader choose the right plan for their needs.</p>

        <h4><strong>8. The Grand Finale: Conclusion & Strong Call to Action</strong></h4>
        <p>Summarize your findings and give your final, definitive recommendation. End with a clear, urgent call to action (CTA).</p>
        <blockquote><em>"After a month of use, I can confidently say Affiliate AI Host is a game-changer for new and experienced affiliates alike. The combination of a high-value product and a revolutionary payment structure is unbeatable. If you're serious about building a daily income stream, there is no better platform to get started on today."</em></blockquote>
        <p>Follow this with a large, can't-miss button:</p>
        <p><strong>[Click Here to Get Started with Affiliate AI Host and Claim Your 70% Commission]</strong> - This button should use your affiliate link.</p>

        <p>By following this structure, you'll create a powerful asset that serves your audience, builds your authority, and generates commissions for years to come.</p>
    `
  },
  {
    title: "Email Marketing Basics: Building Your First List",
    level: "plus",
    imageId: "guide-email-marketing",
    content: `
      <p>Social media is great for reach, but an email list is your most valuable business asset. You don't own your social media followers; the platform does. But you OWN your email list. It's a direct, intimate, and high-converting communication channel that is immune to algorithm changes. This guide will walk you through the foundational concepts and steps to start building and monetizing your first email list.</p>

      <h3>Why Email is Still King in Marketing</h3>
      <p>In an age of fleeting attention spans, email remains the undisputed champion for building relationships and driving sales. Here's why:</p>
      <ul>
          <li><strong>Direct Access:</strong> You can reach your audience directly in their inbox, a personal space they check daily.</li>
          <li><strong>High Engagement:</strong> People on your list have explicitly given you permission to contact them. They are a pre-qualified, warm audience, far more likely to engage with your content than a cold social media follower.</li>
          <li><strong>Incredible ROI:</strong> Email marketing consistently delivers the highest Return on Investment (ROI) of any marketing channel, often cited as high as 42:1 (meaning $42 earned for every $1 spent).</li>
          <li><strong>Asset Ownership:</strong> Your list is a portable asset. If you ever switch platforms or build a new website, you take your list—and your audience—with you.</li>
      </ul>
      
      <hr class="my-6 border-border" />

      <h3>The Four Pillars of Email Marketing</h3>
      <p>Building a successful email marketing system involves four key components:</p>

      <h4><strong>1. The Email Service Provider (ESP)</strong></h4>
      <p>This is the software that manages your list, sends your emails, and tracks your results. You cannot simply use Gmail or Outlook. Using an ESP is essential for managing subscribers, complying with anti-spam laws, and automating your campaigns.</p>
      <p><strong>Top Recommendations for Beginners (with Free Tiers):</strong></p>
      <ul>
          <li><strong>MailerLite:</strong> Extremely user-friendly with a generous free plan for up to 1,000 subscribers. Excellent for beginners.</li>
          <li><strong>ConvertKit:</strong> Built by creators, for creators. Powerful automation features. Free for up to 1,000 subscribers.</li>
          <li><strong>Brevo (formerly Sendinblue):</strong> Offers a good free plan with more advanced features like SMS marketing and a sales CRM.</li>
      </ul>
      <p><strong>Your Action:</strong> Sign up for a free account with one of these providers today. Explore their interface.</p>
      
      <h4><strong>2. The Lead Magnet: The Ethical Bribe</strong></h4>
      <p>People are protective of their email addresses. You need to offer them something of genuine value in exchange for it. This is your "lead magnet." It's an ethical bribe that provides an instant win for your new subscriber.</p>
      <p><strong>Lead Magnet Ideas for Your Niche:</strong></p>
      <ul>
          <li><strong>Checklists:</strong> The <strong>"5-Step Checklist to Launching a Profitable Affiliate Website in 24 Hours"</strong> from your guides is a perfect, ready-to-use lead magnet.</li>
          <li><strong>Ebooks/Guides:</strong> You can download any of your marketing guides as an HTML file, save it as a PDF, and offer it as a free "Beginner's Guide to Affiliate Marketing."</li>
          <li><strong>Email Courses:</strong> Repurpose your "7-Day Automated Email Follow-up Sequence" guide into a free 7-day email course on affiliate marketing.</li>
          <li><strong>Video Tutorial:</strong> Record a short video of you setting up a part of the Affiliate AI Host platform and offer it as a "Quick-Start Video Guide."</li>
      </ul>
      
      <h4><strong>3. The Opt-In Form: The Gateway to Your List</strong></h4>
      <p>Your ESP will provide you with the tools to create an opt-in form. This is the form where people enter their name and email to get your lead magnet. Where you place this form is critical.</p>
      <p><strong>Key Placement Locations:</strong></p>
      <ul>
          <li><strong>On Your Blog:</strong> Embed a form within your product review post. ("Want more tips like this? Get my free launch checklist!")</li>
          <li><strong>As a Pop-Up:</strong> Use a timed or exit-intent pop-up on your website to capture visitors before they leave.</li>
          <li><strong>Your "Link in Bio":</strong> Create a simple landing page (your ESP can help with this) with your opt-in form and use that as your primary link on Instagram or X.</li>
          <li><strong>Footer of Your Website:</strong> A simple "Join our newsletter" form in your site's footer.</li>
      </ul>

      <h4><strong>4. The Welcome Sequence: Building the Relationship</strong></h4>
      <p>This is where the magic happens. A new subscriber is at their peak level of interest. You must capitalize on this with an automated "welcome sequence" of emails. Your "7-Day Automated Email Follow-up Sequence" guide provides a complete, copy-paste template for this. This sequence should:</p>
      <ol>
          <li><strong>Day 1 (Immediately):</strong> Deliver the lead magnet and welcome them to your community.</li>
          <li><strong>Day 2-4 (Value):</strong> Send purely valuable content. Share your best tips, a personal story, or a link to a helpful resource. You are building trust.</li>
          <li><strong>Day 5 (Soft Sell):</strong> Introduce the problem that Affiliate AI Host solves and mention it as the tool you use.</li>
          <li><strong>Day 6-7 (Direct Sell):</strong> Be more direct. Explain the benefits, share testimonials, and use a clear call to action with your affiliate link.</li>
      </ol>
      <p>By automating this sequence, every new subscriber gets a consistent, value-driven experience that naturally guides them toward your affiliate offer. This is how you turn a simple email list into a powerful, automated income stream.</p>
    `
  },
  {
    title: "Your Pre-Launch Checklist",
    level: "pro",
    imageId: "guide-pre-launch",
    content: `
        <p>A successful launch is not an accident; it is the result of meticulous preparation. This is your definitive, step-by-step checklist to follow before you drive any significant traffic to your new affiliate website. Completing these steps will ensure your site is technically sound, secure, and ready to convert visitors into commissions from the moment it goes live.</p>
        
        <h3>Phase 1: Finalize Your Production Environment</h3>
        <p>Your <code>.env</code> file is the central configuration file that holds the secret keys to your external services. During development, it's common to use "sandbox" or "test" keys. Before launch, you MUST switch to live "production" keys. Failure to do so will result in failed payments and a broken user experience.</p>
        <ul>
            <li><strong>PayPal Production Credentials:</strong>
                <ol>
                    <li>Log in to your primary PayPal Developer Dashboard (not the sandbox one).</li>
                    <li>Navigate to the "My Apps & Credentials" section.</li>
                    <li>Ensure you are on the **Live** tab.</li>
                    <li>Copy your **Live Client ID** and **Live Secret**.</li>
                    <li>Open your <code>.env</code> file. Update the <code>PAYPAL_CLIENT_ID</code> and <code>PAYPAL_CLIENT_SECRET</code> with these live credentials. The <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> should also be updated to match your live client ID.</li>
                </ol>
            </li>
            <li><strong>Gemini Production API Key:</strong> Ensure the <code>GEMINI_API_KEY</code> in your <code>.env</code> file is your final, production-ready key from Google AI Studio. Test your AI tools one last time to confirm they are working.</li>
        </ul>

        <h3>Phase 2: Connect Your Custom Domain (DNS Configuration)</h3>
        <p>This is the most critical technical step of your launch. You will be pointing your domain name (e.g., <code>your-affiliate-site.com</code>) to our Google Cloud hosting servers using DNS 'A' Records. This is the professional standard for hosting a website.</p>
        <ol>
            <li><strong>Navigate to Your Hosting Console:</strong> This is where you will get the specific IP addresses for your host. <a href="https://console.firebase.google.com/project/affiliate-ai-host-new/hosting/custom-domains" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline">Click this link to open your project's hosting console</a>, then click the "Add custom domain" button to start the wizard.</li>
            <li><strong>Domain Verification (TXT Record):</strong> The first step in the wizard is to prove you own the domain. The console will provide a unique **TXT record** value. Copy this value.
                <ul>
                    <li>Go to your domain registrar (e.g., your <a href="https://rizzosai.shopco.com/" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline">integrated reseller store</a>, Namecheap, GoDaddy).</li>
                    <li>Find the DNS management or advanced DNS settings for your domain.</li>
                    <li>Add a new record of type "TXT". The "Host" is usually set to '@' (which represents the root domain). Paste the value from the console into the "Value" or "Content" field.</li>
                    <li>Save the record. Verification can take up to an hour but is often faster. Wait for the console to confirm verification before proceeding.</li>
                </ul>
            </li>
            <li><strong>Go Live (A Records):</strong> Once verified, the console will provide you with two **A Records**. These are the IP addresses of the Google Cloud servers.
                <ul>
                    <li>Return to your domain registrar's DNS settings.</li>
                    <li><strong>Crucial Step:</strong> Look for any existing 'A' records for your root domain ('@') and **delete them**. Having conflicting A records will cause your site to not load correctly. Also delete any "Parking" type records.</li>
                    <li>Create your first new 'A' record. Set the "Host" to '@' and paste the first IP address into the "Value" field. Save it.</li>
                    <li>Create a second new 'A' record. Set the "Host" to '@' again and paste the second IP address into the "Value" field. Save it.</li>
                </ul>
            </li>
        </ol>
        <p>Once you have added these two A records, your work is done. It will now take time for these changes to "propagate" across the internet. This can take anywhere from 30 minutes to 24 hours. Once complete, your site will be live at your custom domain with a secure SSL certificate automatically provisioned.</p>
        
        <h3>Phase 3: The Final Live Test</h3>
        <p>Never assume everything works. Before you announce your site to the world, perform a final, end-to-end test as if you were a brand new customer.</p>
        <ul>
            <li>Open a new incognito or private browser window. This ensures you have no admin cookies or cached data.</li>
            <li>Navigate directly to your live domain: <code>https://your-domain.com</code>.</li>
            <li>Go through the entire signup process. Choose the cheapest plan. Use a real, different email address and a real payment method (like a credit card or a different PayPal account).</li>
            <li>Ensure the payment goes through, your new test account is created, and you land on the dashboard.</li>
            <li>Check your main affiliate account's dashboard to see if the new referral appeared correctly.</li>
            <li>Once you've confirmed everything works, you can go to the "Request Refund" page in your new test account to cancel the plan and get your money back.</li>
        </ul>
        
        <h3>Phase 4 (Recommended): Google Search Console Verification</h3>
        <p>To ensure Google can find, index, and rank your new site, you should verify it with Google Search Console.</p>
        <ul>
            <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">Google Search Console</a> and log in with your Google account.</li>
            <li>Add your domain as a new property.</li>
            <li>Choose the "HTML tag" verification method. It's the simplest.</li>
            <li>Google will provide a meta tag that looks like: <code>&lt;meta name="google-site-verification" content="Your_Unique_Code_Here" /&gt;</code>.</li>
            <li>Copy this entire tag.</li>
            <li>In your project's code, open the file <code>src/app/layout.tsx</code>.</li>
            <li>Paste the meta tag you copied into the <code>&lt;head&gt;</code> section of this file.</li>
            <li>Once you save and the site redeploys, go back to Search Console and click "Verify."</li>
        </ul>
        <p>Once you have completed all four phases, your website is technically sound, ready for business, and discoverable by Google. You are now ready to launch.</p>
    `
  },
  {
    title: "Pay-Per-Click (PPC) Advertising for Affiliates",
    level: "pro",
    imageId: "guide-ppc-ads",
    content: `
      <p>While SEO and content marketing are powerful long-term strategies, Pay-Per-Click (PPC) advertising on platforms like Google Ads and Microsoft (Bing) Ads is the fastest way to drive immediate, highly-targeted traffic to your affiliate offers. With PPC, you bid on keywords and pay only when a user clicks your ad. When executed correctly, it can be an incredibly scalable and profitable channel for affiliate marketing. This guide will cover the foundational strategies for launching your first successful PPC campaign.</p>
      
      <h3>The Golden Rule of Affiliate PPC: Never Direct Link</h3>
      <p>The single biggest mistake new affiliates make is sending paid traffic directly to their affiliate link. This will get your ad account banned on almost any platform. Ad platforms see direct affiliate links as low-quality and a poor user experience. Instead, you MUST send all paid traffic to a high-quality **landing page** that you own. For our purposes, your detailed, 1500-word <strong>product review page</strong> is your perfect landing page.</p>
      <p><strong>The Correct Flow:</strong> User searches on Google -> Clicks Your Ad -> Arrives on Your Product Review Page -> Clicks Your Affiliate Link -> Signs Up.</p>

      <hr class="my-6 border-border" />

      <h3>Part 1: Keyword Research - The Foundation of Your Campaign</h3>
      <p>Your campaign will live or die based on the keywords you target. Your goal is to find keywords that show "commercial intent"—meaning the user is looking to buy, not just learn.</p>
      <ul>
        <li><strong>Brainstorming Seed Keywords:</strong> Start with broad terms related to the product: "affiliate hosting," "AI content generator," "daily payout affiliate programs," "web hosting for marketers."</li>
        <li><strong>Using Keyword Tools:</strong> Use free tools like Google Keyword Planner (requires an ads account) or paid tools like Ahrefs/SEMrush to expand your list. Look for "long-tail" keywords.</li>
        <li><strong>Long-Tail Keywords are Gold:</strong> Instead of bidding on a highly competitive, expensive keyword like "web hosting," target a much more specific, long-tail keyword like "best web hosting with daily affiliate payout." These keywords have lower search volume but much higher conversion rates because the user's intent is crystal clear.</li>
        <li><strong>Negative Keywords are Your Shield:</strong> Create a list of negative keywords to prevent your ads from showing for irrelevant searches. If you're selling our hosting, you'll want to add negatives like "-free," "-jobs," "-cpanel," "-tutorial." This saves you an immense amount of money on wasted clicks.</li>
      </ul>

      <h3>Part 2: Structuring Your Google Ads Campaign</h3>
      <p>A logical structure is essential for managing your campaigns and achieving a high Quality Score (Google's rating of your ad's relevance, which affects your cost-per-click).</p>
      <ul>
        <li><strong>Campaign Level:</strong> Set your overall budget, location targeting, and goals at this level. You might have one campaign for "Affiliate AI Host Brand Terms" and another for "General Affiliate Marketing Terms."</li>
        <li><strong>Ad Group Level:</strong> Within a campaign, create tightly-themed Ad Groups. For example, one ad group could target keywords related to "AI content tools," while another targets "high commission affiliate programs." Each ad group should contain 5-15 closely related keywords.</li>
        <li><strong>Ad Level:</strong> Within each ad group, write at least 2-3 different ads. This allows you to A/B test which headlines and descriptions perform best. Google's Responsive Search Ads make this easy.</li>
      </ul>

      <h3>Part 3: Writing High-Converting Ad Copy</h3>
      <p>Your ad has one job: to get the right person to click. It needs to be relevant to the keyword they searched and compelling enough to stand out.</p>
      <h4>Sample Google Ad Copy for "high commission affiliate programs" keyword group:</h4>
      <blockquote>
        <p><strong>Headline 1:</strong> Earn 70% Daily Commissions<br/>
        <strong>Headline 2:</strong> Affiliate AI Host Program<br/>
        <strong>Headline 3:</strong> Payouts Sent Daily To PayPal<br/>
        <strong>Description 1:</strong> Stop waiting 90 days for your money. Join the affiliate program that pays you every single day for your recurring sales.<br/>
        <strong>Description 2:</strong> Promote a high-quality product that combines web hosting with powerful AI tools. Get started now and get your first payout tomorrow.<br/>
        <strong>Final URL:</strong> [YOUR_AFFILIATE_LINK_HERE]
      </blockquote>
      <p><strong>Key Ad Copy Tips:</strong></p>
      <ul>
        <li>Include your main keyword in at least one headline.</li>
        <li>Focus on the biggest, most unique benefit (daily payouts).</li>
        <li>Use strong call-to-actions like "Sign Up Now," "Learn More," or "Read Our Review."</li>
      </ul>

      <h3>Part 4: Budgeting and Bidding</h3>
      <p>PPC can get expensive quickly if you're not careful. Start small and scale intelligently.</p>
      <ul>
        <li><strong>Start with a Small Daily Budget:</strong> Begin with a budget you're comfortable losing, like $10-$20 per day.</li>
        <li><strong>Use an Automated Bidding Strategy:</strong> For beginners, "Maximize Clicks" or "Maximize Conversions" (once you have conversion tracking set up) are good starting points. Let Google's algorithm do the heavy lifting initially.</li>
        <li><strong>Track Your ROI:</strong> This is the most important step. You must know your numbers. If you spend $100 on ads and earn $150 in commissions, you have a profitable campaign. If you spend $100 and earn $50, you need to pause and optimize. Your Affiliate AI Host dashboard will show you your earnings, and your Google Ads dashboard will show you your spending. Compare them daily.</li>
      </ul>
      <p>PPC is a skill that takes time to master, but by focusing on high-intent keywords, sending traffic to a quality landing page, and meticulously tracking your ROI, you can build a powerful and scalable engine for generating affiliate commissions.</p>
    `
  },
  {
    title: "Conversion Rate Optimization (CRO) Fundamentals",
    level: "pro",
    imageId: "guide-cro-fundamentals",
    content: `
      <p>Getting traffic to your website is only half the battle. If those visitors don't take the desired action (i.e., click your affiliate link and sign up), the traffic is worthless. Conversion Rate Optimization (CRO) is the science and art of increasing the percentage of visitors who become customers. Even small improvements in your conversion rate can lead to dramatic increases in your revenue without needing a single extra visitor. This guide introduces the core principles of CRO and how to apply them to your affiliate site.</p>

      <h3>What is a "Conversion" for an Affiliate?</h3>
      <p>In our context, we have two primary conversions to track:</p>
      <ol>
        <li><strong>Micro-Conversion:</strong> A visitor clicking on your affiliate link from your review page.</li>
        <li><strong>Macro-Conversion:</strong> A visitor signing up and activating their account (which you track via your referral dashboard).</li>
      </ol>
      <p>CRO is the process of optimizing your website—primarily your product review page—to maximize the rate at which these conversions happen.</p>

      <hr class="my-6 border-border" />
      
      <h3>The Core Methodology: A/B Testing</h3>
      <p>You cannot optimize what you don't measure. The foundation of all CRO is A/B testing (also known as split testing). The concept is simple:</p>
      <ul>
        <li>You create two versions of a page: Version A (the original, or "control") and Version B (the new version with a single element changed, the "variant").</li>
        <li>You show Version A to 50% of your visitors and Version B to the other 50%.</li>
        <li>You track which version results in a higher conversion rate.</li>
        <li>The winning version becomes the new control, and you repeat the process with a new test.</li>
      </ul>
      <p><strong>CRITICAL RULE:</strong> Only change **one element at a time**. If you change both the headline and the button color, you won't know which change was responsible for the increase or decrease in conversions.</p>
      <p><strong>Tools for A/B Testing:</strong></p>
      <ul>
        <li><strong>Google Optimize:</strong> A powerful and free tool from Google that integrates with Google Analytics. This is the best place to start.</li>
        <li><strong>VWO (Visual Website Optimizer):</strong> A more user-friendly, but paid, platform with a suite of CRO tools.</li>
        <li><strong>Optimizely:</strong> An enterprise-level platform for advanced testing.</li>
      </ul>
      
      <h3>Key Elements to Test on Your Review Page</h3>
      <p>Here are the highest-impact elements you should start testing on your product review landing page.</p>

      <h4><strong>1. The Headline</strong></h4>
      <p>Your headline is the first thing visitors read. It must grab their attention and convey a powerful benefit.</p>
      <ul>
        <li><strong>Test Emotion vs. Logic:</strong>
          <ul>
            <li><strong>A:</strong> "Affiliate AI Host: A Detailed Review of Features & Pricing" (Logical)</li>
            <li><strong>B:</strong> "How I Built a Daily Income Stream with This Affiliate Program" (Emotional/Benefit-Driven)</li>
          </ul>
        </li>
        <li><strong>Test Specificity:</strong>
          <ul>
            <li><strong>A:</strong> "Earn High Commissions" (Vague)</li>
            <li><strong>B:</strong> "Earn 70% Daily Commissions via PayPal" (Specific)</li>
          </ul>
        </li>
      </ul>

      <h4><strong>2. The Call-to-Action (CTA) Button</strong></h4>
      <p>Your CTA is the gateway to your commission. Every aspect of it can be optimized.</p>
      <ul>
        <li><strong>Button Text (The Ask):</strong>
          <ul>
            <li><strong>A:</strong> "Submit" or "Learn More" (Weak)</li>
            <li><strong>B:</strong> "Get Started Now" or "Claim Your 70% Commission" (Strong, Action-Oriented)</li>
          </ul>
        </li>
        <li><strong>Button Color:</strong> The key is contrast. Your button should be a color that stands out from the rest of your page. If your page is mostly blue and white, an orange or green button will draw the eye. Test it.</li>
        <li><strong>Button Placement:</strong> Should your CTA be at the top of the page? Only at the bottom? Or placed after every major section? Test placing your CTA button "above the fold" (visible without scrolling) and at the very end of your review.</li>
      </ul>

      <h4><strong>3. Trust Signals</strong></h4>
      <p>Visitors are skeptical. You need to build their trust and reduce their perceived risk.</p>
      <ul>
        <li><strong>Testimonials:</strong> Try placing your best testimonial right next to your primary CTA button.</li>
        <li><strong>Money-Back Guarantee:</strong> Explicitly mention the "24-hour no-questions-asked refund policy" near the signup button. This directly addresses the visitor's financial risk.</li>
        <li><strong>Social Proof:</strong> If you have multiple referrals, you can add a line like "Join 50+ other smart affiliates who have already made the switch."</li>
      </ul>

      <h4><strong>4. Page Layout and Media</strong></h4>
      <ul>
        <li><strong>Image vs. Video:</strong> Test replacing a static screenshot with a short video walkthrough of the product dashboard. Videos often have much higher engagement.</li>
        <li><strong>Simplify Your Content:</strong> Try a version of your review with shorter paragraphs, more bullet points, and more bolded text. Sometimes, making your content easier to scan can dramatically improve readership and conversions.</li>
      </ul>
      <p>CRO is an ongoing process of continuous improvement. By adopting a mindset of "test everything," you can systematically increase the profitability of your affiliate website over time, turning it into a highly-optimized conversion machine.</p>
    `
  },
  {
    title: "Your 7-Day Automated Email Follow-up Sequence",
    level: "pro",
    imageId: "guide-email-sequence",
    content: `
        <p>A new email subscriber is a hot lead. They have just raised their hand and expressed interest in what you have to offer. This 7-day automated email sequence, also known as a "drip campaign," is your most powerful tool for converting that initial interest into a paying referral. It's designed to be set up once in your email service provider (like MailerLite or ConvertKit) and then works for you 24/7, nurturing every new subscriber.</p>
        <p>This sequence is strategically designed to build trust, deliver value, handle objections, and then ask for the sale. Each email has a specific purpose. Let's dive in.</p>

        <hr class="my-6 border-border" />

        <h3>Email 1: The Welcome & The Gift (Sent Immediately)</h3>
        <p><strong>Purpose:</strong> Fulfill your promise, deliver the lead magnet, and set expectations. The open rate on this email will be the highest you ever get.</p>
        <p><strong>Subject:</strong> Your Free 24-Hour Launch Checklist is Here!</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hi [First Name],</p>
            <p>Thank you and welcome! I'm genuinely excited to have you here.</p>
            <p>As promised, here is your exclusive guide: <strong>The 5-Step Checklist to Launching a Profitable Affiliate Website in 24 Hours.</strong> This is the exact framework I used to get my own business off the ground, and I'm confident it can help you too.</p>
            <p><em>(Here, you can either paste the content of the checklist directly into the email or provide a link to a PDF version of the guide.)</em></p>
            <p>Over the next few days, I'm going to be sharing some of the most impactful lessons I've learned on my affiliate marketing journey—including the single biggest mistake that holds most beginners back.</p>
            <p>Keep an eye out for tomorrow's email. For now, dive into that checklist and take your first step!</p>
            <p>To your success,</p>
            <p>[Your Name]</p>
        </blockquote>

        <hr class="my-6 border-border" />

        <h3>Email 2: The Value Bomb & The Common Enemy (Send on Day 2)</h3>
        <p><strong>Purpose:</strong> Build trust by providing value with no strings attached. Identify a common "enemy" or problem to show you're on their side.</p>
        <p><strong>Subject:</strong> The #1 Mistake That Kept Me Broke in Affiliate Marketing</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hi [First Name],</p>
            <p>Yesterday you got the launch checklist. It’s all about taking massive, imperfect action.</p>
            <p>But before you get too deep, I need to warn you about the biggest trap I fell into when I started: <strong>I was trying to sell products instead of solving problems.</strong></p>
            <p>I was so focused on the commission that I forgot my real job as an affiliate marketer isn't to be a pushy salesperson. It's to be a trusted guide. Your audience has problems. They want to make extra money, they want to start an online business, they're frustrated with their current 9-to-5. Our job is to find great tools that solve those problems and then share our genuine experience.</p>
            <p>The reason I'm so passionate about the platform I use, Affiliate AI Host, is because it solves three huge problems at once: the need for reliable hosting, the struggle of creating content, and the frustration with slow, low-paying affiliate programs.</p>
            <p>When you shift your mindset from "selling" to "solving," everything changes. Focus on being the most helpful person your audience knows, and the commissions will follow naturally. You become a resource, not an advertisement.</p>
            <p>Talk tomorrow,</p>
            <p>[Your Name]</p>
        </blockquote>

        <hr class="my-6 border-border" />

        <h3>Email 3: The "Behind the Curtain" Look (Send on Day 4)</h3>
        <p><strong>Purpose:</strong> Introduce your solution (Affiliate AI Host) in a low-pressure way by showing, not just telling. Create curiosity.</p>
        <p><strong>Subject:</strong> A quick peek inside my affiliate command center</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hey [First Name],</p>
            <p>We've talked about strategy, but I'm a visual person. I wanted to give you a quick "behind the curtain" look at the platform I actually use to run my affiliate business every day.</p>
            <p>It’s not just about the incredible 70-75% daily commissions (though that’s a huge part of it!). It’s about the tools that make earning them so much easier. My personal favorite is the <strong>AI Content Generator</strong>. I can literally generate a week's worth of social media posts in about 5 minutes. It's a massive time-saver.</p>
            <p>If you're curious to see what the dashboard looks like and how the affiliate tracking works in real-time, you can check out the platform tour here:</p>
            <p><a href="[YOUR_AFFILIATE_LINK_HERE]" target="_blank" rel="noopener noreferrer"><strong>[Your Affiliate Link Here]</strong></a></p>
            <p>It’s worth a look just to see how a platform built *for* affiliates is structured. No pressure to buy, just wanted to share what's working for me.</p>
            <p>Best,</p>
            <p>[Your Name]</p>
        </blockquote>
        
        <hr class="my-6 border-border" />

        <h3>Email 4: The Case Study / Social Proof (Send on Day 6)</h3>
        <p><strong>Purpose:</strong> Overcome skepticism by showing that other people, just like the reader, are succeeding with this.</p>
        <p><strong>Subject:</strong> How Sarah went from $0 to daily PayPal alerts</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hi [First Name],</p>
            <p>I want to share a quick story about someone I was talking to in our community, Sarah. She was new to affiliate marketing and deeply frustrated with the typical model—promote a product, make a sale, and then wait 3 months to maybe get paid.</p>
            <p>She decided to try Affiliate AI Host, paid her one-time activation fee, and used the guides to set up her review site over a weekend. Within her first week, she got her first two referrals.</p>
            <p>After their 3-day trial ended, she saw her first commission pop up in her PayPal. Then another the next day. And the next. She told me the motivation from seeing that daily feedback loop—real money, in her account—was the most powerful force she's ever experienced in business.</p>
            <p>This isn't a unique story. It's what happens when you combine a great product with a fair payment system. You can follow the exact same path. It all starts with the right platform.</p>
            <p><a href="[YOUR_AFFILIATE_LINK_HERE]" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline"><strong>Get the same tools and system Sarah used right here.</strong></a></p>
            <p>Talk soon,</p>
            <p>[Your Name]</p>
        </blockquote>
        
        <hr class="my-6 border-border" />

        <h3>Email 5: The Final Call & Risk Reversal (Send on Day 7)</h3>
        <p><strong>Purpose:</strong> Create a sense of urgency and remove any final barriers to entry by highlighting the money-back guarantee.</p>
        <p><strong>Subject:</strong> Your risk-free chance to start (final email)</p>
        <blockquote class="border-l-4 pl-4 italic">
            <p>Hi [First Name],</p>
            <p>It’s been a week since you downloaded the launch checklist. If you haven't taken that first step yet, I have to ask: what's holding you back?</p>
            <p>Often, it's a fear of risk. "What if I pay for this and it's not for me?" It's a valid concern. And that's why the platform has a **24-hour, no-questions-asked refund policy** on the one-time activation fee. You can literally get inside, use all the tools, see the entire system, and if you decide within 24 hours that it's not the right fit for you, you get a full refund. There is zero financial risk to you.</p>
            <p>The opportunity to build a daily income stream is right in front of you. The best time to start was yesterday. The second-best time is now. Don't let hesitation rob you of a potential breakthrough.</p>
            <p><a href="[YOUR_AFFILIATE_LINK_HERE]" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold hover:underline"><strong>Click Here to Create Your Account & Launch Your Affiliate Business Today.</strong></a></p>
            <p>This is your moment. Don't let it pass you by.</p>
            <p>To your success,</p>
            <p>[Your Name]</p>
        </blockquote>
    `
  },
  {
    title: "Developing Strategic Partnerships & Joint Ventures",
    level: "enterprise",
    imageId: "guide-partnerships",
    content: `
      <p>At the enterprise level of affiliate marketing, your focus shifts from one-to-one selling to one-to-many. You are no longer just a marketer; you are a business developer. The fastest way to achieve explosive, step-function growth is to leverage the work and audiences that other people have already built. This is done through strategic partnerships and Joint Ventures (JVs). A single successful JV can generate more revenue in one week than a year of solo marketing efforts.</p>
      
      <h3>The Mindset Shift: From Affiliate to Partner</h3>
      <p>A JV is not just asking someone to "use your link." A JV is a formal collaboration where you and another business owner team up for a mutually beneficial promotion. You are bringing a high-quality, high-converting offer (Affiliate AI Host) to the table. They are bringing a trusted, established audience. It's a partnership of equals.</p>

      <h3>Part 1: Identifying Your Ideal JV Partners</h3>
      <p>The success of your outreach depends entirely on the quality of your prospecting. You are not looking for just anyone; you are looking for specific creators and businesses whose audiences are a perfect fit for your offer.</p>
      <p><strong>Your Ideal Partner Profile:</strong></p>
      <ul>
        <li><strong>Niche Alignment:</strong> They operate in a complementary, non-competitive niche. Good niches include: 'digital marketing', 'make money online', 'blogging', 'web development', 'SaaS reviews', 'course creation', and 'small business coaching'.</li>
        <li><strong>Audience Ownership:</strong> They have an engaged email list of at least 5,000 subscribers or a YouTube channel with a loyal following. Follower counts on social media are less important than an owned audience (email/subscribers) that they can contact directly.</li>
        <li><strong>Trust and Authority:</strong> They are a respected voice in their community. Their audience trusts their recommendations.</li>
        <li><strong>The "Promotion Gap":</strong> Crucially, they are NOT currently promoting a direct competitor (i.e., another web hosting or all-in-one affiliate platform). You are looking to fill a gap in their product recommendations.</li>
      </ul>
      <p><strong>How to Find Them:</strong></p>
      <ul>
        <li><strong>YouTube:</strong> Search for your target keywords ("how to start a blog," "best side hustles 2024"). Look for channels with 10k-100k subscribers. The host's email is often in their 'About' section.</li>
        <li><strong>Newsletters:</strong> Subscribe to popular newsletters in your target niche. See what products they promote. The best partners are often those who provide great content but have fewer sponsors.</li>
        <li><strong>Podcast Guests:</strong> Look at the guest lists for popular business podcasts. These guests are often experts with their own audiences and are open to collaboration.</li>
      </ul>

      <hr class="my-6 border-border" />
      
      <h3>Part 2: The JV Pitch - Crafting an Irresistible Offer</h3>
      <p>Do not send a generic, copy-paste email. Your pitch must be personalized, professional, and highlight the value for *them* and *their audience*.</p>
      
      <h4>The Pre-Outreach (The Warm-up):</h4>
      <p>Before you ever send an email, you must get on their radar. For at least two weeks before your pitch:</p>
      <ol>
        <li>Subscribe to their email list.</li>
        <li>Follow them on social media.</li>
        <li>Reply to their emails or comment on their posts with genuine, insightful thoughts. Add to the conversation. Make your name familiar.</li>
      </ol>

      <h4>The Pitch Email Template:</h4>
      <p><strong>Subject:</strong> Partnership Idea for the [Their Brand Name] audience</p>
      <blockquote class="border-l-4 pl-4 italic">
        <p>Hi [Partner's Name],</p>
        <p>My name is [Your Name], and I've been a big fan of your work on [Their Platform/Content] for a while. Your recent piece on [Mention a specific article/video] was particularly insightful.</p>
        <p>The reason I'm reaching out is that I'm a top affiliate for a new platform called Affiliate AI Host, and I believe it could be a massive value-add for your audience of [Describe their audience].</p>
        <p>It’s an all-in-one platform that combines high-speed hosting with AI content tools, and it's built around the most aggressive affiliate program I've ever seen (70-75% commissions, paid out daily). For your audience members looking to monetize their expertise or start an online business, it’s a perfect fit.</p>
        <p>I'm not just looking for a promotion. I'd like to propose a proper joint venture where we can provide maximum value to your community. One idea could be a free, live webinar where you teach [Their Area of Expertise] and I do a 15-minute demo on how Affiliate AI Host can help them execute on that strategy. </p>
        <p>We would, of course, structure this as a partnership where you receive the full affiliate commission for every referral that comes from your audience. For the "Pro" plan, that's nearly $35/day per customer, which could build into a significant, recurring revenue stream for your business.</p>
        <p>Would you be open to a brief 15-minute chat next week to explore this further?</p>
        <p>Best regards,</p>
        <p>[Your Name]</p>
        <p>[Link to Your Website/LinkedIn Profile]</p>
      </blockquote>
      
      <h3>Part 3: Structuring the JV Deal</h3>
      <p>Be prepared to discuss the terms of the partnership.</p>
      <ul>
        <li><strong>Commission:</strong> Always offer them the full affiliate commission. Your benefit comes from the massive volume they can drive.</li>
        <li><strong>Tracking:</strong> You will provide them with THEIR OWN unique affiliate link from your downline (or work with the platform to have one created for the JV). This ensures transparent tracking.</li>
        <li><strong>The "Bonus Stack":</strong> To make their offer irresistible, create an exclusive bonus package for their audience. This could be a private Q&A session, a short video course you've created, or a set of templates. This gives their audience a reason to buy *through them* and makes the partner look good.</li>
        <li><strong>Promotion Schedule:</strong> Agree on a specific promotion window (e.g., a one-week campaign) with specific email dates and social media posts. Provide them with "swipe copy"—pre-written email and social media templates they can adapt. Make it as easy as possible for them to say yes.</li>
      </ul>
      <p>Strategic partnerships are the pinnacle of affiliate marketing. They require professionalism, patience, and a value-driven approach. By mastering this skill, you transition from earning commissions to engineering massive, scalable revenue events.</p>
    `
  }
];


export default function GuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
      if (typeof window !== 'undefined') {
          setOrigin(window.location.origin);
      }
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc<UserType>(userDocRef);

  const processedContent = useMemo(() => {
    if (!selectedGuide || !origin) return '';
    let content = selectedGuide.content;

    const hasSavedDomain = userData?.customDomain?.name;
    const username = userData?.username;
    
    // Determine the affiliate link based on custom domain or username
    const affiliateLink = hasSavedDomain
      ? `https://${userData.customDomain.name}`
      : username
        ? `${origin}/?ref=${username}`
        : null;

    if (affiliateLink) {
      // Replace the generic placeholder
      content = content.replace(/\[YOUR_AFFILIATE_LINK_HERE\]/g, affiliateLink);
    }
    
    // Also replace just the username placeholder if it exists on its own
    if (username) {
        content = content.replace(/\[YOUR_USERNAME_HERE\]/g, username);
    }
    
    return content;
  }, [selectedGuide, userData, origin]);


  const handleDownload = () => {
    if (!selectedGuide) return;

    // Create a valid filename from the title
    const filename = `${selectedGuide.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    
    // Create the full HTML content for the file
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${selectedGuide.title}</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          h3 { color: #1a1a1a; }
          code { background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
          a { color: #007bff; }
          ul, ol { padding-left: 20px; }
          blockquote { border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0; color: #666; font-style: italic; }
          hr { border: 0; border-top: 1px solid #eee; margin: 2em 0; }
        </style>
      </head>
      <body>
        <h1>${selectedGuide.title}</h1>
        ${processedContent}
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Marketing Guides</h1>
        <p className="text-muted-foreground">
          Your library of expert guides to help you grow your affiliate business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allGuides.map((guide) => {
            const guideImage = PlaceHolderImages.find(p => p.id === guide.imageId);
            return (
                <Card key={guide.title} className="flex flex-col overflow-hidden">
                    {guideImage ? (
                        <div className="relative h-48 w-full">
                            <Image
                                src={guideImage.imageUrl}
                                alt={guideImage.description}
                                data-ai-hint={guideImage.imageHint}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="relative h-48 w-full bg-secondary flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-muted-foreground" />
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle>{guide.title}</CardTitle>
                        <CardDescription>
                            Access Level: <span className="font-semibold text-primary">{guide.level.charAt(0).toUpperCase() + guide.level.slice(1)}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1" />
                    <CardFooter>
                        <Button className="w-full" onClick={() => setSelectedGuide(guide)}>
                        Read Guide
                        </Button>
                    </CardFooter>
                </Card>
            )
        })}
      </div>

      <Dialog
        open={!!selectedGuide}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedGuide(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl pr-6">
              {selectedGuide?.title}
            </DialogTitle>
            <DialogDescription>
              Access Level: {selectedGuide?.level.charAt(0).toUpperCase() + (selectedGuide?.level.slice(1) || '')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-6 space-y-4 text-foreground/90 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:pl-2 [&_code]:bg-muted [&_code]:font-mono [&_code]:px-1.5 [&_code]:py-1 [&_code]:rounded-sm [&_a]:text-primary [&_a]:hover:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
            <div
              dangerouslySetInnerHTML={{ __html: processedContent || '' }}
            />
          </div>
          <DialogFooter className="mt-4 sm:justify-start gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={handleDownload}
            >
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelectedGuide(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
