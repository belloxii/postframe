# PostFrame Chrome Extension (Manifest V3)

> **"Turn any Facebook post you're viewing into a beautiful HD image."**

This Chrome Extension works directly in the active browser tab to extract visible Facebook post content (author, avatar, text, media, reactions, comments, shares, timestamp) with zero access to private cookies, session tokens, or browser credentials.

---

## 🚀 How to Install & Use (Developer / Unpacked Mode)

1. Open **Google Chrome** (or Edge / Brave / Chromium).
2. Navigate to `chrome://extensions` in your browser address bar.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left.
5. Select the `extension/` directory of this project.
6. The **PostFrame** icon will appear in your Chrome toolbar!

---

## 🎯 Workflow

1. Navigate to any Facebook post (e.g. `facebook.com/...`).
2. Click the **PostFrame** extension icon in your toolbar.
3. PostFrame will automatically detect and highlight the post on your screen.
4. Review the extracted preview, metrics, and confidence score.
5. Click **Capture Post** ➔ **Open in PostFrame HD**.
6. PostFrame opens with the imported post ready for template customization and HD image export (1x, 2x, 4x)!

---

## 🛡️ Security & Privacy Compliance

- **No Cookie Access**: The extension does not read or transmit any Facebook cookies, auth tokens, or passwords.
- **Strict DOM Scope**: Only extracts visibly rendered elements currently displayed to the user.
- **Ephemeral Transfers**: Post payloads sent to PostFrame use short-lived temporary import IDs that automatically expire.
