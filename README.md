
# Affiliate AI Host - Deployment Guide (v1.1.7)

This application is optimized for high-speed performance and global delivery. You can deploy it to **Cloudflare Pages** (Recommended) or **Railway**.

---

## 🐙 How to Upload to GitHub (First Step)

Before deploying to Cloudflare or Railway, your code must be on GitHub.

1.  **Create a Repository**:
    - Log in to [GitHub](https://github.com).
    - Click **"New"** to create a repository.
    - Give it a name (e.g., `affiliate-ai-host`).
    - Keep it **Private** or **Public**. Do **not** initialize with a README or license.
    - Click **"Create repository"**.

2.  **Push from Firebase Studio**:
    - Open the **Terminal** at the bottom of this screen.
    - Run these commands one by one (Replace `YOUR_URL` with the one GitHub gave you):
    ```bash
    git init
    git add .
    git commit -m "Initial commit v1.1.7"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```
    - *Note: If prompted for a password, use a **GitHub Personal Access Token (PAT)**.*

---

## ☁️ How to Deploy to Cloudflare Pages (Recommended)

Cloudflare Pages provides superior global speed.

1.  **Connect to Cloudflare**:
    - Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
    - Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
    - Select your GitHub repository.

2.  **Configure Build Settings**:
    - **Framework preset**: `Next.js`
    - **Build command**: `npm run build`
    - **Build output directory**: `.next`
    - **Root directory**: `/`

3.  **Add Environment Variables (BULK UPLOAD)**:
    - Go to the **Settings** tab of your Pages project > **Variables and Secrets**.
    - Click **"Edit variables"** > **"Bulk edit"**.
    - Copy your entire `.env` file and paste it in. Click **Save**.

4.  **Deploy**: Click **Save and Deploy**.

---

## 🚀 How to Deploy to Railway (Alternative)

1.  **Connect Railway**: Go to [railway.app](https://railway.app) and create a "New Project" from your GitHub repo.
2.  **Set Variables**: Use the **"Raw Editor"** in the Variables tab to paste your `.env` content.

---

## 🛠️ Custom Domain Setup (Required for Database)

### Step 1: Authorize Domain in Firebase Auth
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. **Build** -> **Authentication** -> **Settings** -> **Authorized domains**.
3. Add `hostproai.com` (or your Cloudflare domain).

### Step 2: Whitelist in Google Cloud
1. Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit **"Browser key (auto-created by Firebase)"**.
3. Under **"Website restrictions"**, add:
   - `https://hostproai.com/*`
   - `https://*.hostproai.com/*`
   - `https://YOUR_CLOUDFLARE_SUBDOMAIN.pages.dev/*`
4. Click **Save**.

---

© 2025 Affiliate AI Host. Max-Velocity Version 1.1.7 Enabled.
