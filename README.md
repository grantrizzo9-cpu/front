
# Affiliate AI Host - Deployment Guide (v1.1.8)

This application is optimized for high-speed performance and global delivery. You can deploy it to **Cloudflare Pages** (Recommended).

---

## 🚀 How to Upload to GitHub (Step-by-Step)

Before deploying to Cloudflare, your code must be on GitHub. Run these commands **one by one** in the terminal:

1.  **Stage your changes**:
    ```bash
    git add .
    ```

2.  **Commit your changes**:
    ```bash
    git commit -m "Final Version 1.1.8: Absolute Velocity Shell"
    ```

3.  **Push to GitHub**:
    ```bash
    git push origin main
    ```

---

## ☁️ How to Deploy to Cloudflare Pages (Recommended)

1.  **Connect to Cloudflare**:
    - Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
    - Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
    - Select your GitHub repository.

2.  **Configure Build Settings (CRITICAL)**:
    - **Framework preset**: `Next.js`
    - **Build command**: `npm run build`
    - **Build output directory**: `.next`
    - **Root directory**: `/`
    - **⚠️ IMPORTANT (DEPLOY COMMAND)**: Ensure the "Deploy command" field is completely **EMPTY**. Cloudflare handles the deployment automatically. Entering `npx wrangler deploy` here will cause the build to fail.

3.  **Add Environment Variables (BULK UPLOAD)**:
    - Go to the **Settings** tab of your Pages project > **Variables and Secrets**.
    - Click **"Edit variables"** > **"Bulk edit"**.
    - Copy your entire `.env` file and paste it in. Click **Save**.
    - **💡 Security Note**: Cloudflare shows the *names* of variables in logs to track changes, but your *values* are encrypted and never shown publicly.

4.  **Connect Your Domain**:
    - After deployment, go to the **"Custom domains"** tab in your Pages project.
    - Click **"Set up a custom domain"** and enter your domain (e.g., `yourdomain.com`).
    - Cloudflare will automatically handle the DNS settings for you.

---

## 🛠️ Firebase Configuration (Required for Database)

### Step 1: Authorize Domain in Firebase Auth
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. **Build** -> **Authentication** -> **Settings** -> **Authorized domains**.
3. Add your specific custom domain (e.g., `yourdomain.com`) AND your Cloudflare preview URL (e.g., `yourproject.pages.dev`). This is required for Login/Signup to work.

### Step 2: Whitelist in Google Cloud (Critical)
1. Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit **"Browser key (auto-created by Firebase)"**.
3. Under **"Website restrictions"**, add:
   - `https://yourdomain.com/*`
   - `https://*.pages.dev/*`
4. Click **Save**.

---

© 2025 Affiliate AI Host. Max-Velocity Version 1.1.8 Enabled.
