
import type { GenerateWebsiteOutput } from '@/ai/flows/website-generator';

function toHtmlParagraphs(content: string): string {
    return content.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p.trim()}</p>`).join('\n');
}

export function getHomepageHtml(site: GenerateWebsiteOutput, link: string): string {
    const { homepage, theme, username } = site;
    const platformBaseUrl = 'https://hostproai.com';
      
    const themeColorsCss = Object.entries(theme.colors)
        .map(([key, value]) => `    ${key}: ${value};`)
        .join('\n');
    
    const navLinksHtml = homepage.navLinks.map(link => `<li><a href="${link.href}">${link.text}</a></li>`).join('');

    const featuresHtml = homepage.features.map(f => `
        <div class="feature">
            <div class="feature-icon">${f.icon}</div>
            <h3>${f.title}</h3>
            <p>${f.description}</p>
        </div>
    `).join('');

    const howItWorksStepsHtml = homepage.howItWorksSteps.map((step, i) => `
      <div class="step">
          <div class="step-number">${i + 1}</div>
          <div>
              <h3>${step.title}</h3>
              <p>${step.description}</p>
          </div>
      </div>
    `).join('');

    const testimonialsHtml = homepage.testimonials.map(t => `
      <div class="testimonial-card">
          <p class="testimonial-text">"${t.text}"</p>
          <div class="testimonial-author">
              <p class="author-name">${t.name}</p>
              <p class="author-role">${t.role}</p>
          </div>
      </div>
    `).join('');

    const faqsHtml = homepage.faqs.map(faq => `
      <details class="faq-item">
          <summary>${faq.question}</summary>
          <p>${faq.answer}</p>
      </details>
    `).join('');
    
    const footerHtml = `
      <footer>
        <div class="container">
          <div class="footer-grid">
            <div class="footer-col">
              <div class="footer-logo">Affiliate AI Host</div>
              <p class="footer-description">The future of affiliate marketing and web hosting, powered by AI.</p>
            </div>
            <div class="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="${platformBaseUrl}/pricing?ref=${username}" target="_blank">Pricing</a></li>
                <li><a href="${platformBaseUrl}/#features?ref=${username}" target="_blank">Features</a></li>
                <li><a href="${platformBaseUrl}/#faq?ref=${username}" target="_blank">FAQ</a></li>
                <li><a href="${platformBaseUrl}/login?ref=${username}" target="_blank">Login</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#" onclick="openModal('terms-modal', event)">Terms of Service</a></li>
                <li><a href="#" onclick="openModal('privacy-modal', event)">Privacy Policy</a></li>
                <li><a href="#" onclick="openModal('disclaimer-modal', event)">Disclaimer</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="${platformBaseUrl}/about?ref=${username}" target="_blank">About Us</a></li>
                <li><a href="${platformBaseUrl}/contact?ref=${username}" target="_blank">Contact</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; <span id="copyright-year"></span> Affiliate AI Host. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;

    const modalsHtml = `
        <div id="terms-modal" class="modal">
          <div class="modal-content">
            <span class="modal-close" onclick="closeModal('terms-modal')">&times;</span>
            <h2>Terms of Service</h2>
            ${toHtmlParagraphs(site.terms)}
          </div>
        </div>
        <div id="privacy-modal" class="modal">
          <div class="modal-content">
            <span class="modal-close" onclick="closeModal('privacy-modal')">&times;</span>
            <h2>Privacy Policy</h2>
            ${toHtmlParagraphs(site.privacy)}
          </div>
        </div>
        <div id="disclaimer-modal" class="modal">
          <div class="modal-content">
            <span class="modal-close" onclick="closeModal('disclaimer-modal')">&times;</span>
            <h2>Earnings Disclaimer</h2>
            ${toHtmlParagraphs(site.disclaimer)}
          </div>
        </div>
    `;

    return `
<!DOCTYPE html>
<html lang="en" style="scroll-behavior: smooth;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${homepage.title}</title>
    <style>
        :root {
${themeColorsCss}
        }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            margin: 0; padding: 0; background-color: var(--background-color); color: var(--text-color); 
            line-height: 1.7;
        }
        .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
        section { padding: 60px 0; }
        @media(min-width: 768px) { section { padding: 80px 0; } }
        h1, h2, h3, h4 { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; font-weight: 700; margin-top: 0; letter-spacing: -0.02em; color: var(--text-color)}
        h1 { font-size: 2.5rem; }
        h2 { font-size: 2.25rem; text-align: center; margin-bottom: 3rem; }
        h4 { font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-color); }
        @media(min-width: 768px) { h1 { font-size: 3.5rem; } h2 { font-size: 2.75rem; } }
        p { margin-top: 0; color: var(--muted-color); }
        a { color: var(--primary-color); text-decoration: none; }
        .btn { display: inline-block; background-color: var(--primary-color); color: white; padding: 14px 28px; font-size: 1rem; font-weight: 600; border-radius: 8px; text-decoration: none; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .btn:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
        
        .dark-theme .btn { color: var(--text-color); }
        .dark-theme .hero .btn, .dark-theme .final-cta .btn { color: var(--text-color); }
        
        /* Header */
        header.main-header {
            position: sticky; top: 0; z-index: 100; border-bottom: 1px solid color-mix(in srgb, var(--border-color, var(--card-background)) 50%, transparent);
            background: color-mix(in srgb, var(--card-background) 80%, transparent);
            backdrop-filter: blur(10px);
        }
        header .container { display: flex; align-items: center; justify-content: space-between; height: 72px; }
        .logo { font-size: 1.25rem; font-weight: 700; color: var(--text-color); }
        .main-nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 1.5rem; }
        .main-nav a { font-weight: 500; color: var(--muted-color); transition: color 0.2s; }
        .main-nav a:hover { color: var(--text-color); }

        /* Hero */
        .hero { text-align: center; padding: 80px 0; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; }
        .hero h1 { color: white; }
        .hero p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.9); max-width: 650px; margin: 1.5rem auto 2.5rem; }
        @media(min-width: 768px) { .hero p { font-size: 1.25rem; } }

        /* Sections */
        .section-alt { background-color: var(--card-background); }
        .dark-theme .section-alt { background-color: color-mix(in srgb, var(--background-color) 70%, white); }

        /* Features */
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
        .feature { text-align: center; }
        .feature-icon { font-size: 2rem; margin-bottom: 1rem; line-height: 1; color: var(--primary-color); }
        .feature h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .feature p { font-size: 0.95rem; }

        /* How it Works */
        .steps-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
        @media(min-width: 768px) { .steps-grid { grid-template-columns: repeat(3, 1fr); } }
        .step { display: flex; align-items: flex-start; gap: 1.5rem; text-align: left; }
        .step-number { flex-shrink: 0; width: 40px; height: 40px; background-color: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem; }
        .step h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .step p { margin-bottom: 0; font-size: 0.95rem; }
        
        /* Testimonials */
        .testimonials-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width: 768px) { .testimonials-grid { grid-template-columns: repeat(3, 1fr); } }
        .testimonial-card { background: var(--card-background); padding: 2rem; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--border-color, var(--card-background)) 50%, transparent); }
        .testimonial-text { font-style: italic; }
        .testimonial-author { margin-top: 1.5rem; }
        .author-name { font-weight: 600; color: var(--text-color); }
        .author-role { font-size: 0.9rem; }

        /* FAQ */
        .faq-container { max-width: 768px; margin: 0 auto; }
        .faq-item { border-bottom: 1px solid color-mix(in srgb, var(--border-color, var(--card-background)) 50%, transparent); padding: 1rem 0; }
        .faq-item summary { font-size: 1.1rem; font-weight: 600; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; color: var(--text-color); }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after { content: '+'; font-size: 1.5rem; font-weight: 400; transition: transform 0.2s; color: var(--primary-color); }
        .faq-item[open] summary::after { transform: rotate(45deg); }
        .faq-item p { margin-top: 1rem; padding-left: 0.5rem; border-left: 2px solid var(--primary-color); }
        
        /* Final CTA */
        .final-cta { text-align: center; }
        .final-cta p { font-size: 1.1rem; max-width: 650px; margin: 1.5rem auto 2.5rem; }
        @media(min-width: 768px) { .final-cta p { font-size: 1.25rem; } }

        /* Footer */
        footer { padding: 60px 20px; border-top: 1px solid color-mix(in srgb, var(--border-color, var(--card-background)) 50%, transparent); margin-top: 60px; background: var(--card-background); }
        .footer-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; text-align: center;}
        @media(min-width: 768px) { .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; text-align: left; } }
        .footer-col .footer-logo { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-color); }
        .footer-col .footer-description { font-size: 0.9rem; max-width: 300px; margin: 0 auto; }
        @media(min-width: 768px) { .footer-col .footer-description { margin: 0; } }
        .footer-col h4 { margin-bottom: 1rem; }
        .footer-col ul { list-style: none; padding: 0; margin: 0; }
        .footer-col ul li { margin-bottom: 0.75rem; }
        .footer-col ul a { color: var(--muted-color); font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
        .footer-col ul a:hover { color: var(--text-color); }
        .footer-bottom { border-top: 1px solid color-mix(in srgb, var(--border-color, var(--card-background)) 50%, transparent); margin-top: 3rem; padding-top: 2rem; text-align: center; font-size: 0.9rem; color: var(--muted-color); }


        /* Modal styles */
        .modal { display: none; position: fixed; z-index: 1001; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.6); animation: fadeIn 0.3s; }
        .modal-content { background-color: var(--card-background); color: var(--text-color); margin: 5% auto; padding: 30px; border: 1px solid var(--border-color, #eee); border-radius: 12px; width: 80%; max-width: 700px; position: relative; animation: slideIn 0.3s; }
        .modal-content h2 { text-align: left; }
        .modal-close { color: #aaa; position: absolute; top: 15px; right: 25px; font-size: 28px; font-weight: bold; cursor: pointer; }
        .modal-close:hover, .modal-close:focus { color: var(--text-color); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    </style>
</head>
<body class="${theme.name === 'Midnight Glow' ? 'dark-theme' : 'light-theme'}">

    <header class="main-header">
        <div class="container">
            <div class="logo">${homepage.title}</div>
            <nav class="main-nav"><ul>${navLinksHtml}</ul></nav>
            <a href="${link}" class="btn">Sign Up</a>
        </div>
    </header>

    <main>
        <section id="hero" class="hero">
            <div class="container">
                <h1>${homepage.headline}</h1>
                <p>${homepage.subheadline}</p>
                <a href="${link}" class="btn">${homepage.ctaButtonText}</a>
            </div>
        </section>

        <section id="features" class="container">
            <h2>${homepage.featuresHeadline}</h2>
            <div class="features-grid">${featuresHtml}</div>
        </section>

        <section id="how-it-works" class="section-alt">
            <div class="container">
                <h2>${homepage.howItWorksHeadline}</h2>
                <div class="steps-grid">${howItWorksStepsHtml}</div>
            </div>
        </section>

        <section id="testimonials" class="container">
             <h2>${homepage.testimonialsHeadline}</h2>
            <div class="testimonials-grid">${testimonialsHtml}</div>
        </section>

        <section id="faq" class="section-alt">
            <div class="container">
                <h2>${homepage.faqHeadline}</h2>
                <div class="faq-container">${faqsHtml}</div>
            </div>
        </section>
        
        <section id="final-cta" class="final-cta container">
            <h2>${homepage.finalCtaHeadline}</h2>
            <p>${homepage.finalCtaSubheadline}</p>
            <a href="${link}" class="btn">${homepage.finalCtaButtonText}</a>
        </section>
    </main>
    
    ${footerHtml}
    
    ${modalsHtml}

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const el = document.getElementById('copyright-year');
        if (el) el.textContent = new Date().getFullYear();
      });
      function openModal(id, event) {
        if(event) event.preventDefault();
        document.getElementById(id).style.display = 'block';
        document.body.style.overflow = 'hidden';
      }
      function closeModal(id) {
        document.getElementById(id).style.display = 'none';
        document.body.style.overflow = 'auto';
      }
      window.onclick = function(event) {
        const modals = document.getElementsByClassName('modal');
        for (let i = 0; i < modals.length; i++) {
            if (event.target == modals[i]) {
                modals[i].style.display = "none";
                document.body.style.overflow = 'auto';
            }
        }
      }
    </script>
</body>
</html>
    `;
}
