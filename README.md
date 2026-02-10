
# Affiliate AI Host - New Key Recovery Guide (v1.3.5)

You have deleted your original API key. Follow these steps to restore service.

---

## ✅ Step 1: Create & Whitelist New Key
1.  Open [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials).
2.  Click **+ Create credentials** -> **API Key**.
3.  Click **Edit** on the new key.
4.  Under **Website restrictions**, add these as TWO SEPARATE entries:
    *   `https://hostproai.com/*`
    *   `https://front-h603.onrender.com/*`
5.  Click **SAVE**.

---

## 🔑 Step 2: Update Render Environment
1.  Copy the **New API Key** string.
2.  Go to your **Render Dashboard** -> **Environment**.
3.  Update `NEXT_PUBLIC_FIREBASE_API_KEY` with the new key.
4.  Save and wait for Render to redeploy.

---

## 🛠️ Step 3: Sync the Code
Run these commands in your terminal to apply the v1.3.5 diagnostics:

1. `git add .`
2. `git commit -m "New Key Recovery v1.3.5"`
3. `git push origin main`

---

© 2025 Affiliate AI Host. New Key Recovery Sync v1.3.5.
