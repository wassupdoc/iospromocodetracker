# 🎯 App Store Promo Code Distributor

This script automates the distribution of **Apple App Store promo codes** via **Google Sheets** and **Apps Script**.

## ✨ Features
- Automatically distributes promo codes to users
- Redirects users directly to App Store redemption
- Marks codes as "Redeemed" in Google Sheets
- Generates QR codes for easy mobile redemption
- Tracks code expiration (28 days from upload)
- Sends email notifications when all codes are used
- Auto-resets when new codes are added
- Redirects to custom site when no codes available

## 🔄 How It Works
1. User accesses the web app link
2. Script provides next available code and redirects to App Store
3. Code is marked as "Redeemed" in the spreadsheet
4. Developer gets notified when all codes are used
5. System auto-resets when new codes are added

## 📋 Setup Guide

### 1. Prepare Google Sheet
Create a sheet with these columns:
- Column A: Promo Code
- Column B: Status (Blank = Available, "Redeemed" = Used)
- Column C: Upload Date (Auto-filled)
- Column D: Expiration Date (Auto-set to upload date + 28 days)
- Cell E1: Reserved for notification tracking

### 2. Add the Script
1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Delete any existing code
4. Paste the script from this repository
5. Replace `"https://freeradicalsoft.com"` with your redirect URL

### 3. Initial Setup (Developer Only)
1. Open the Apps Script editor
2. Run the `setupScript()` function once
3. Run the `createTrigger()` function once
4. Authorize the script when prompted

### 4. Deploy as Web App
1. Click Deploy → New deployment
2. Choose "Web app" as deployment type
3. Set "Execute as" to your account (developer)
4. Set "Who has access" to "Anyone"
5. Click Deploy and copy the URL

## 🔑 Important Notes
- Only the developer needs to authorize the script
- End users can access the web app without Google permissions
- All sheet operations run under developer's authority

## 📱 Usage
1. Share the web app URL with users
2. Users clicking the link will:
   - Get a promo code and App Store redirect if codes are available
   - See a message and redirect to your site if no codes are available
3. Add new codes anytime to the sheet:
   - Upload/expiration dates are set automatically
   - System resets notification status for new batches
   - No manual intervention needed

## 🚀 Benefits
- Fully automated distribution
- Zero maintenance after setup
- Automatic tracking and notifications
- User-friendly redemption process



