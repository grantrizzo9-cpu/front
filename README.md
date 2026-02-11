
# Affiliate AI Host - Final Launch Guide (v1.4.1)

You are logged in! Follow these final steps to go live at `hostproai.com`.

---

## 🛠️ Step 1: Enable Web Frameworks
Firebase needs to be told to handle Next.js automatically. Run this command:
`firebase experiments:enable webframeworks`

---

## 🏗️ Step 2: Set Project Context
Ensure the terminal is targeting the correct project:
`firebase use rent-a-host-a55fd`

---

## 🔑 Step 3: Check Your API Key
Since you are no longer using Render, you must paste your **New API Key** (the one you created in Google Cloud) directly into the code.
1. Open `src/firebase/config.ts` in the file explorer.
2. Replace `"REPLACE_WITH_NEW_KEY"` with your actual key string.

---

## 🚀 Step 4: Deploy to hostproai.com
Run the final command to build and upload your site:
`firebase deploy`

---

© 2025 Affiliate AI Host. Final Deploy Sync v1.4.1.
