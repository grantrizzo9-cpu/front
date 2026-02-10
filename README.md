
# Affiliate AI Host - Final Connection Guide (v1.3.4)

Your platform is ready. To complete the setup, you must ensure your **Custom Domain** is whitelisted in Google Cloud.

---

## ✅ Step 1: Sync the Code
Run these commands in your terminal to apply the multi-domain fix:

1. `git add .`
2. `git commit -m "Custom Domain Sync v1.3.4"`
3. `git push origin main`

---

## 🔒 Step 2: Whitelist Your Custom Domain
If you are visiting **hostproai.com**, Google Cloud will block it unless it's explicitly in your list.

1.  Open [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials).
2.  Click on your **API Key** (e.g. Browser key).
3.  Under **Website restrictions**, ensure BOTH of these are present:
    *   `https://front-h603.onrender.com/*`
    *   `https://hostproai.com/*`  <-- **ADD THIS ONE NOW**
4.  Click the **Blue SAVE Button**.
5.  Wait **5 minutes** for Google's global network to update.

---

## 🛠️ Step 3: Clear the Browser Cache
Google Cloud changes take time to propagate. If Signup still says "offline":

1.  Refresh your site.
2.  Click the **"Still saying offline? Click here"** link at the bottom of the Signup form.
3.  This forces a fresh connection using your new whitelist.

---

© 2025 Affiliate AI Host. Custom Domain Sync v1.3.4.
