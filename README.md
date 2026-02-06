
# Affiliate AI Host - Deployment Guide (v1.1.7)

This application is optimized for high-speed performance and global delivery. You can deploy it to **Cloudflare Pages** (Recommended) or **Railway**.

---

## 🚀 How to Upload to GitHub (Step-by-Step)

Before deploying to Cloudflare, your code must be on GitHub. Run these commands **one by one** in the terminal:

1.  **Stage your changes**:
    ```bash
    git add .
    ```

2.  **Commit your changes**:
    ```bash
    git commit -m "Final Version 1.1.7: Max Velocity Shell"
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
    - **⚠️ IMPORTANT**: Leave the "Deploy command" or any custom script fields **EMPTY**. Cloudflare handles the deployment automatically after the build command.

3.  **Add Environment Variables (BULK UPLOAD)**:
    - Go to the **Settings** tab of your Pages project > **Variables and Secrets**.
    - Click **"Edit variables"** > **"Bulk edit"**.
    - Copy your entire `.env` file and paste it in. Click **Save**.

4.  **Deploy**: Click **Save and Deploy**.

---

## 🛠️ Firebase Configuration (Required for Database)

### Step 1: Authorize Domain in Firebase Auth
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. **Build** -> **Authentication** -> **Settings** -> **Authorized domains**.
3. Add your specific Cloudflare domain (e.g., `your-app.pages.dev`).

### Step 2: Whitelist in Google Cloud (Critical)
1. Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit **"Browser key (auto-created by Firebase)"**.
3. Under **"Website restrictions"**, add:
   - `https://your-app.pages.dev/*`
4. Click **Save**.

---

© 2025 Affiliate AI Host. Max-Velocity Version 1.1.7 Enabled.
