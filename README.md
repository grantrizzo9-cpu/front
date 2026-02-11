
# Affiliate AI Host - Firebase Hosting Launch Guide (v1.3.9)

Your domain `hostproai.com` is connected! Follow these steps to finish the terminal login and push your code live.

---

## 🛠️ Step 1: Complete the Terminal Login
You are currently at the prompt: `? Enable Gemini in Firebase features? (Y/n)`

1.  **Answer**: Type `Y` and press **Enter**.
2.  **Authorize**: The terminal will provide a long URL. **Copy and open it** in your browser.
3.  **Permission**: Sign in with your Google account and click **Allow**.
4.  **Code**: Copy the **Authorization Code** provided by Google.
5.  **Paste**: Go back to your terminal, paste the code, and press **Enter**.

---

## 🏗️ Step 2: Set Project Context
Once the terminal says "Success! Logged in", run this command:
`firebase use rent-a-host-a55fd`

---

## 🚀 Step 3: Deploy to hostproai.com
Run the final command to upload your site:
`firebase deploy`

---

## 🔑 Troubleshooting
- **Site Not Found**: If you still see this after `firebase deploy` says "Complete", wait 2 minutes for the global cache to update.
- **API Key**: Ensure you have pasted your **New API Key** into `src/firebase/config.ts` if you haven't already.

---

© 2025 Affiliate AI Host. Firebase Hosting Sync v1.3.9.
