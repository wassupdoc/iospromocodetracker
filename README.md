# 🎯 App Store Promo Code Distributor

This script automates the distribution of **Apple App Store promo codes** via **Google Sheets** and **Apps Script**.

## 📋 Prerequisites
- Google account
- Apple Developer account with promo codes
- Basic familiarity with Google Sheets
- Your website URL for redirects (when no codes available)

## 🚀 Quick Start (Recommended)
1. Open the [template spreadsheet](https://docs.google.com/spreadsheets/d/1tkYNCup-ZtKozkpF6s96E__1DcsUUtso0afIQbF-poE/edit?usp=sharing)
2. Make a copy: **File → Make a copy**
3. Follow the Configuration and Deployment steps below

## ⚙️ Configuration
1. Open the Apps Script editor (**Extensions → Apps Script**)
2. Find the CONFIG object at the top of the script:
   ```javascript
   const CONFIG = {
     EXPIRATION_DAYS: 28,
     REDIRECT_URL: "https://yourwebsite.com"
   };
   ```
3. Replace `yourwebsite.com` with your actual website URL
4. Save the script

## 🔄 Initial Setup
1. In the Apps Script editor:
   - Run the `initialize()` function
   - Authorize when prompted
2. Deploy as web app:
   - Click **Deploy → New deployment**
   - Choose "Web app" as type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click Deploy and copy the URL

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
- Script runs under developer's account permissions
- End users don't need Google account access
- Only the developer needs to authorize the script
- All sheet operations are secure and authenticated

## 🎯 How It Works
1. User accesses the web app URL
2. System provides next available code
3. User gets redirected to App Store
4. Code is marked as "Redeemed"
5. QR code provided for mobile users
6. Developer notified when codes run out

## ✨ Features
- Automatic code distribution
- Direct App Store redemption
- QR code generation
- 28-day expiration tracking
- Email notifications
- Auto-reset for new codes
- Custom site redirect when empty

## 📧 Notifications
The script sends email notifications:
- When all codes are used/expired
- To the email associated with your Google account
- Subject: "All Promo Codes Redeemed or Expired"
- One-time notification (resets when new codes added)

## 📊 Monitoring & Maintenance
1. View Usage:
   - Open the sheet to see redemption status
   - Check Apps Script logs for detailed history
   - Monitor email notifications

2. Backup Procedures:
   - Regularly export sheet to CSV
   - Save script versions before updates
   - Keep copy of deployment settings

3. Rate Limits:
   - Google Apps Script quotas apply
   - 20,000 executions per day
   - 30 simultaneous executions
   - [See Google's quota documentation](https://developers.google.com/apps-script/guides/services/quotas)

4. Dependencies:
   - QuickChart.io for QR code generation
   - Google Sheets API
   - Google Apps Script services

## 🔄 Updating
When new versions are released:
1. Backup your current script
2. Copy new code from GitHub
3. Update your CONFIG settings
4. Test with sample codes
5. Redeploy as new version

## 📱 Usage Guide
1. Share web app URL with users
2. Users receive:
   - Available code → App Store redirect
   - No codes → Custom site redirect
3. Add codes anytime:
   - Dates set automatically
   - System resets notifications
   - No manual steps needed

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
   - Verify CONFIG.REDIRECT_URL is properly formatted
   - Ensure all setup steps were completed

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



