
# Affiliate AI Host - Deployment Guide (v1.1.8)

This application is optimized for high-speed performance. Follow these steps exactly to ensure your site is live and the database is connected.

---

## 🚀 How to Sync Your Code (Run these ONE BY ONE)

Do not use commas. Copy and paste each line into the terminal, then press Enter.

1.  **Stage changes**:
    ```bash
    git add .
    ```

2.  **Commit changes**:
    ```bash
    git commit -m "Final Version 1.1.8: Absolute Velocity"
    ```

3.  **Push to GitHub**:
    ```bash
    git push origin main
    ```

---

## ☁️ How to Deploy to Cloudflare Pages

1.  **Select Repository**: In your Cloudflare Dashboard, go to **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git** and select your repo.
2.  **Configure Build**:
    - **Framework preset**: Select `Next.js`.
    - **Build command**: `npm run build`
    - **Build output directory**: `.next`
    - **⚠️ IMPORTANT (DEPLOY COMMAND)**: This field must be completely **EMPTY**. If Cloudflare forces a value, enter `:` (a single colon). **DO NOT** enter `/`.
3.  **Add Environment Variables**: Go to the **Settings** tab > **Variables and Secrets** > **Bulk edit**. Copy your `.env` file content here.

---

## 🛠️ Fix "Site Can't Be Reached" (NXDOMAIN)

If you see an "NXDOMAIN" error after pointing your nameservers to Cloudflare:

1.  Go to your project in the **Cloudflare Pages Dashboard**.
2.  Click the **"Custom domains"** tab.
3.  Click **"Set up a custom domain"**.
4.  Enter `hostproai.com` and click Continue.
5.  Cloudflare will automatically configure the DNS records to point your domain to the Pages project. **Wait 5-10 minutes** for this to update globally.

---

## 🔐 Authorize Domain in Firebase (Required for Database)

The database will **NOT** work until you complete these steps:

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  **Authentication** -> **Settings** -> **Authorized domains**.
3.  Add `hostproai.com` AND your `*.pages.dev` URL.
4.  Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
5.  Edit **"Browser key (auto-created by Firebase)"**.
6.  Under **"Website restrictions"**, add:
   - `https://hostproai.com/*`
   - `https://*.pages.dev/*`
7.  Click **Save**.

---

© 2025 Affiliate AI Host. Absolute-Velocity Version 1.1.8 Enabled.
