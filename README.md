
# Affiliate AI Host - Deployment Guide (v1.1.7)

This application is optimized for high-speed performance and global delivery. You can deploy it to **Cloudflare Pages** (Recommended) or **Railway**.

---

## ☁️ How to Deploy to Cloudflare Pages (Recommended)

Cloudflare Pages provides superior global speed and is excellent for Next.js applications.

1.  **Push to GitHub**: Ensure your latest code is pushed to your repository.
    - `git add .`
    - `git commit -m "Ready for Cloudflare deployment"`
    - `git push origin main`

2.  **Connect to Cloudflare**:
    - Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
    - Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
    - Select your GitHub repository.

3.  **Configure Build Settings**:
    - **Framework preset**: `Next.js`
    - **Build command**: `npm run build`
    - **Build output directory**: `.next`
    - **Root directory**: `/`

4.  **Add Environment Variables (BULK UPLOAD)**:
    - You don't have to add them one by one!
    - Go to the **Settings** tab of your Pages project > **Variables and Secrets**.
    - Click **"Edit variables"** in the Environment Variables section.
    - Look for the **"Bulk edit"** button (usually at the top right of the edit area).
    - Copy the entire contents of your `.env` file and paste them into the text box. 
    - Cloudflare will automatically parse the `KEY=VALUE` format.
    - Click **Save**.

5.  **Deploy**: Click **Save and Deploy**.

---

## 🚀 How to Deploy to Railway (Alternative)

1.  **Push to GitHub**: Railway automatically deploys when you push code.
2.  **Connect Railway**: 
    - Go to [railway.app](https://railway.app).
    - Create a "New Project" -> "Deploy from GitHub repo".
3.  **Set Environment Variables**: 
    - In your Railway project, go to **Variables**.
    - Click **"Raw Editor"** to paste your entire `.env` file at once.

---

## 🛠️ Fix GitHub Authentication (ECONNREFUSED)
If you see "ECONNREFUSED" in your terminal, run:
`git config --global credential.helper store`
Then use your **GitHub Personal Access Token (PAT)** as the password when prompted.

---

## 🌐 Custom Domain Setup (hostproai.com)

### Step 1: Authorize Domain in Firebase Auth
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. **Build** -> **Authentication** -> **Settings** -> **Authorized domains**.
3. Add `hostproai.com`.

### Step 2: Whitelist in Google Cloud (Required for Database)
1. Go to [Google Cloud API Credentials](https://console.cloud.google.com/apis/credentials).
2. Select project **`rent-a-host-a55fd`**.
3. Edit **"Browser key (auto-created by Firebase)"**.
4. Under **"Website restrictions"**, add:
   - `https://hostproai.com/*`
   - `https://*.hostproai.com/*`
5. Click **Save**.

---

© 2025 Affiliate AI Host. Max-Velocity Version 1.1.7 Enabled.
