
# Affiliate AI Host - Project Launch & Submission Guide (v1.4.5)

Your project is now configured for `hostproai-cc2e3` with full **AUD Currency Integration**. Follow these steps to submit your changes to GitHub and deploy them live.

---

## 🛠️ Step 1: Submit to GitHub
Run these commands in your terminal to save your changes and push them to your repository:

1.  **Add all changes**:
    `git add .`
2.  **Commit with a message**:
    `git commit -m "AUD currency integration and Firebase project sync v1.4.5"`
3.  **Push to GitHub**:
    `git push origin main`

---

## 🛠️ Step 2: Set Project Context
Ensure your terminal is pointing to your new Firebase project:
`firebase use hostproai-cc2e3`

---

## 🛠️ Step 3: Enable Web Frameworks
Firebase needs this to handle the Next.js build automatically:
`firebase experiments:enable webframeworks`

---

## 🔑 Step 4: Update Your API Key
1. Go to your **** -> **APIs & Services** -> **Credentials**.
2. Copy your **API Key**.
3. Open `src/firebase/config.ts` and paste it into the `apiKey` field.

---

## 🚀 Step 5: Deploy Live
Run the final command to build and upload your site:
`firebase deploy`

---

© 2025 Affiliate AI Host. AUD Integration Sync v1.4.5.
