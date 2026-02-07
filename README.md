# Affiliate AI Host - Final Launch Guide (v1.2.0)

You have successfully deleted the "Hello World" Worker! Now, we just need to tell Cloudflare to show your **real website code** on your domain.

---

## 🚀 Step 1: Sync Your Final Code
Run these three commands in your terminal to make sure GitHub has your professional landing page:
1. `git add .`
2. `git commit -m "Final System Sync v1.2.0"`
3. `git push origin main`

---

## ⚙️ Step 2: The Build Settings (Your Screenshot)
In the Cloudflare screen you are looking at right now, enter these exact settings:

1.  **Framework preset:** Select **Next.js** from the dropdown.
2.  **Build command:** `npm run build`
3.  **Build output directory:** `.next`
4.  **Root directory:** Leave as `/` (default).
5.  Click **Save and Deploy** at the bottom.

---

## 🔐 Step 3: Connect Your Domain
Once the build finishes (it will take about 2 minutes):

1.  Click the **Custom domains** tab at the top of your project page.
2.  Click the blue **"Set up a custom domain"** button.
3.  Type in `hostproai.com` and click **Continue**.
4.  Cloudflare will ask you to "Activate" or "Finish setup"—click the button to confirm.

---

### ✅ Success Check
Visit `hostproai.com`. You will no longer see "Hello world." Instead, you will see your professional **Affiliate AI Host** landing page!

© 2025 Affiliate AI Host. Final Sync v1.2.0.
