# 🎯 App Store Promo Code Distributor

This script automates the distribution of **Apple App Store promo codes** via **Google Sheets** and **Apps Script**.

## 🎬 Live Demo
Try it yourself: [See it in action](https://script.google.com/macros/s/AKfycbzuNbx225PC1HHchhIw_B4iza0hdHVpEuG9Yy5VMaXuhg2arghmegTJbEqX_ARkSTsw/exec)

What you'll see:
- If codes are available: promo code with Copy, App Store redemption link, and QR code
- If no codes: Redirect to the app website
- A footer linking to this open-source project on GitHub
- Mobile-friendly interface
- Instant code delivery

Note: This is an instance using real codes for my iOS app [Roughcut](https://livup.app/roughcut) for demo purposes.

## 📋 Prerequisites
- Google account
- Apple Developer account with promo codes
- Basic familiarity with Google Sheets
- Your app name and website URL (shown on the redemption page; also used when no codes remain)

## 🚀 Quick Start (Recommended)
1. Open the [template spreadsheet](https://docs.google.com/spreadsheets/d/1tkYNCup-ZtKozkpF6s96E__1DcsUUtso0afIQbF-poE/edit?usp=sharing)
2. Make a copy: **File → Make a copy**
3. Copy and paste your apple promo codes into column 1, leave other columns blank
4. Follow the Configuration and Deployment steps below

## ⚙️ Configuration
1. Open the Apps Script editor (**Extensions → Apps Script**)
2. Find the CONFIG object at the top of the script:
   ```javascript
   const CONFIG = {
     EXPIRATION_DAYS: 28,
     APP_NAME: "Your App",
     APP_WEBSITE_URL: "https://yourwebsite.com"
   };
   ```
3. Set `APP_NAME` to your app’s display name
4. Replace `yourwebsite.com` with your app website URL (homepage link + empty-state redirect)
5. Save the script

## 🔄 Initial Setup
1. In the Apps Script editor:
   - Run the `initialize()` function
   - Authorize when prompted
2. Deploy as web app:
   - Click **Deploy → New deployment**
   - Choose "Web app" as type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - **Important**: Check "Allow access to anyone, even anonymous"
   - Click Deploy and copy the URL
3. Test deployment:
   - Open URL in an incognito window
   - If you see "unable to open file" error:
     1. Delete all deployments
     2. Create new deployment
     3. Ensure sheet is shared with anyone (view only)
     4. Try deployment again

Note: The sheet must be accessible to anyone with the link (View only) for the web app to work properly.

## 🌐 Custom Domain (Optional)
Make the app appear to run on your domain:
1. Copy your web app URL after deployment
2. In your domain provider's settings:
   - Create a subdomain (e.g., `codes.yourwebsite.com`)
   - Set up URL forwarding to your web app URL
   - Enable "Forward with masking" or "URL masking" if available
3. Share your custom domain URL instead of the Google Scripts URL

Note: The actual script still runs on Google's servers, but users will see your domain in their browser.

## 📝 Manual Sheet Setup (Alternative)
If not using the template, create a sheet with:
- Column A: Promo Code
- Column B: Status (Blank = Available, "Redeemed" = Used)
- Column C: Upload Date (Auto-filled)
- Column D: Expiration Date (Auto-set to upload date + 28 days)
- Cell E1: Reserved for notification tracking

## 🔐 Security & Permissions
- Script runs under developer's account permissions (intended behavior)
- End users don't need Google account access
- Only the developer needs to authorize the script
- All sheet operations are secure and authenticated
- "Execute as Me" setting ensures:
  - Secure sheet access
  - Protected email notifications
  - Controlled code distribution
  - Single point of management

## 🎯 How It Works
1. User accesses the web app URL
2. System provides next available code
3. User can copy the code, open App Store redemption, or scan the QR code
4. Code is marked as "Redeemed"
5. QR code provided for mobile users
6. Developer notified when codes run out

## ✨ Features
- Automatic code distribution
- Visible promo code with one-tap Copy
- Direct App Store redemption (user-initiated)
- QR code generation
- Configurable app name on the redemption page
- 28-day expiration tracking
- Email notifications
- Auto-reset for new codes
- App website link + redirect when empty
- GitHub footer on redemption and out-of-codes pages (encourages others to deploy their own copy)

## 📧 Notifications
The script sends email notifications:
- When all codes are used/expired
- To the email associated with your Google account
- Subject: "All Promo Codes Redeemed or Expired"
- One-time notification (resets when new codes added)

## ❗ Troubleshooting
Common issues and solutions:
1. Authorization errors:
   - Ensure you're logged into correct Google account
   - Re-run setup functions
   - Check deployment settings
2. Codes not distributing:
   - Verify sheet structure
   - Check date formats
   - Ensure codes aren't marked as used
3. Script errors:
   - Check Apps Script logs for error details
   - Verify CONFIG.APP_WEBSITE_URL is properly formatted
   - Ensure all setup steps were completed
4. "Unable to open file" error:
   - Ensure sheet is shared (Anyone with link - Viewer)
   - Create new deployment from scratch
   - Check "Allow access to anyone, even anonymous"
   - Test in incognito window
   - Clear browser cache and try again

## 🔄 Maintenance
- Add new codes directly to sheet
- System auto-updates dates
- No regular maintenance needed
- Script updates preserve settings

## 🚀 Benefits
- Zero-touch operation
- Automatic tracking
- User-friendly interface
- Secure distribution

## 🔒 Google Verification
Important: Each developer who deploys this script needs their own verification if they plan to distribute their deployment widely (>100 users).

When you deploy this script from GitHub:
- You create your own instance of the app
- You'll need your own verification if serving >100 users
- The verification process applies to your deployment
- You'll need your own privacy policy and terms

Steps for Your Verification:
1. Prepare Required Documents:
   - Your own Privacy Policy
   - Your own Terms of Service
   - Your application homepage
   - Demo video of your deployment

2. Update Script Properties:
   - Add app name in script properties
   - Add support email
   - Add links to policy documents

3. Submit for Verification:
   1. In Apps Script editor: **Deploy → New deployment**
   2. Click "Configure OAuth" (under "Web app")
   3. Fill in Application Details:
      - Application name
      - Support email
      - Developer email
      - Links to privacy policy & terms
   4. Click "Configure Consent Screen"
   5. Complete OAuth Consent Screen in Google Cloud Console
   6. Submit for verification

Required OAuth Scopes Explanation:
- `https://www.googleapis.com/auth/spreadsheets`: Manage promo codes
- `https://www.googleapis.com/auth/script.scriptapp`: Create triggers
- `https://www.googleapis.com/auth/script.send_mail`: Send notifications

Note: For internal use or <100 users, verification is not required for your deployment, but users will see an "unverified app" warning.

## 👩‍💻 Development & Sync
Keep the template and GitHub version in sync using clasp:

1. Install clasp:
   ```bash
   npm install -g @google/clasp
   ```

2. Login to Google:
   ```bash
   clasp login
   ```

3. Clone the template script:
   ```bash
   clasp clone "1tkYNCup-ZtKozkpF6s96E__1DcsUUtso0afIQbF-poE" --rootDir ./src
   ```

4. Push updates:
   ```bash
   clasp push
   ```

5. Pull changes:
   ```bash
   clasp pull
   ```

Note: You'll need to enable the Google Apps Script API in your Google Cloud Console.

For template maintainers:
1. Make changes locally
2. Test changes
3. Push to both GitHub and template:
   ```bash
   git push origin main
   clasp push
   ```

This ensures both versions stay synchronized.



