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
2. Find the line: `var redirectURL = "https://yourwebsite.com";`
3. Replace `yourwebsite.com` with your actual website URL
4. Save the script

## 🔄 Initial Setup
1. In the Apps Script editor:
   - Run the `setupScript()` function
   - Run the `createTrigger()` function
   - Authorize when prompted
2. Deploy as web app:
   - Click **Deploy → New deployment**
   - Choose "Web app" as type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click Deploy and copy the URL

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



