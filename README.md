
# Affiliate AI Host - New Project Launch Guide (v1.4.3)

Your project is now configured for `hostproai-cc2e3`. Follow these steps to go live.

---

## 🛠️ Step 1: Set Project Context
In the terminal, run this command to point to your new project:
`firebase use hostproai-cc2e3`

---

## 🛠️ Step 2: Enable Web Frameworks
Firebase needs to be told to handle Next.js automatically:
`firebase experiments:enable webframeworks`

---

## 🔑 Step 3: Update Your API Key
1. Go to your **Firebase Console** -> **Project Settings**.
2. Copy your **Web API Key**, **App ID**, and **Messaging Sender ID**.
3. Open `src/firebase/config.ts` and paste them into the corresponding fields.

---

## 🚀 Step 4: Deploy
Run the final command to build and upload:
`firebase deploy`

---

© 2025 Affiliate AI Host. Project Migration Sync v1.4.3.
