// Configuration constants
const CONFIG = {
  EXPIRATION_DAYS: 28,
  // TODO: Replace with your website URL where users will be redirected when no codes are available
  REDIRECT_URL: "https://yourwebsite.com"
};

/**
 * Updates upload and expiration dates for promo codes
 * @throws {Error} If sheet operations fail
 */
function updateDates() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) { // Skip headers
      var uploadDateRaw = data[i][2];
      var expirationDateRaw = data[i][3];
      
      // Check if upload date is missing or invalid
      var uploadDate = new Date(uploadDateRaw);
      var needsUploadDate = !uploadDateRaw || uploadDateRaw === '' || isNaN(uploadDate.getTime());
      
      if (needsUploadDate) {
        var todayDate = new Date();
        todayDate.setHours(0,0,0,0);
        sheet.getRange(i + 1, 3).setValue(todayDate);
        uploadDate = todayDate;
      }

      // Check if expiration date is missing, invalid, or needs updating
      var expirationDate = new Date(expirationDateRaw);
      var needsExpirationDate = !expirationDateRaw || 
                               expirationDateRaw === '' || 
                               isNaN(expirationDate.getTime()) ||
                               needsUploadDate;
      
      if (needsExpirationDate) {
        var expDate = new Date(uploadDate);
        expDate.setDate(expDate.getDate() + CONFIG.EXPIRATION_DAYS);
        expDate.setHours(0,0,0,0);
        sheet.getRange(i + 1, 4).setValue(expDate);
      }
    }
  } catch (error) {
    console.error('Error updating dates:', error);
    throw error;
  }
}

/**
 * Creates an onEdit trigger for automatic date updates
 */
function createTrigger() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    ScriptApp.newTrigger('updateDates')
      .forSpreadsheet(sheet)
      .onEdit()
      .create();
  } catch (error) {
    console.error('Error creating trigger:', error);
    throw error;
  }
}

/**
 * Generates HTML for code redemption page
 * @param {string} promoCode - The promo code to redeem
 * @returns {string} HTML content
 */
function generateRedemptionHtml(promoCode) {
  var appStoreURL = "https://apps.apple.com/redeem?code=" + promoCode;
  var qrCodeURL = "https://quickchart.io/qr?text=" + encodeURIComponent(appStoreURL) + "&size=200";
  
  return `<html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8f8f8; }
        .container { max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
        .btn { background-color: #007aff; color: white; padding: 12px 20px; font-size: 18px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px 0; }
        .btn:hover { background-color: #005ecb; }
        .qr-container { margin-top: 20px; }
      </style>
      <script>
        function openAppStore() { window.open("${appStoreURL}", "_blank"); }
        window.onload = openAppStore;
      </script>
    </head>
    <body>
      <div class="container">
        <h2>Your Free App Promo Code</h2>
        <p>Click below to redeem your code:</p>
        <a class="btn" href="${appStoreURL}" target="_blank">Redeem Code</a>
        <div class="qr-container">
          <p>Or scan the QR code:</p>
          <img src="${qrCodeURL}" alt="QR Code">
        </div>
      </div>
    </body>
  </html>`;
}

/**
 * Generates HTML for no codes available page
 * @returns {string} HTML content
 */
function generateNoCodesHtml() {
  return `<html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8f8f8; }
        .container { max-width: 400px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
        .msg { font-size: 18px; color: #333; }
      </style>
      <script>
        setTimeout(function() { window.location.href = "${CONFIG.REDIRECT_URL}"; }, 5000);
      </script>
    </head>
    <body>
      <div class="container">
        <p class="msg">Sorry, all promo codes have been redeemed or expired.</p>
        <p class="msg">You will be redirected shortly.</p>
        <p><a href="${CONFIG.REDIRECT_URL}">Click here if you are not redirected.</a></p>
      </div>
    </body>
  </html>`;
}

/**
 * Handles web app requests
 * @returns {HtmlOutput} The HTML page to display
 */
function doGet() {
  try {
    updateDates();
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var ownerEmail = PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL');
    var today = new Date();
    today.setHours(0,0,0,0);
    var allRedeemed = true;

    // Look for available code
    for (var i = 1; i < data.length; i++) {
      var promoCode = data[i][0];
      var status = data[i][1];
      var expirationDate = new Date(data[i][3]);
      expirationDate.setHours(0,0,0,0);

      if (status !== "Redeemed" && expirationDate > today) {
        sheet.getRange(i + 1, 2).setValue("Redeemed");
        return HtmlService.createHtmlOutput(generateRedemptionHtml(promoCode))
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      } else if (status !== "Redeemed" && expirationDate <= today) {
        sheet.getRange(i + 1, 2).setValue("Expired");
      } else {
        allRedeemed = allRedeemed && true;
      }
    }

    // Notify if all codes are used
    if (allRedeemed && sheet.getRange("E1").getValue() !== "Notified") {
      try {
        MailApp.sendEmail(ownerEmail, 
          "All Promo Codes Redeemed or Expired", 
          "All promo codes in your Google Sheet have been used or expired.");
        sheet.getRange("E1").setValue("Notified");
      } catch (error) {
        console.error('Error sending notification email:', error);
      }
    }

    return HtmlService.createHtmlOutput(generateNoCodesHtml())
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return HtmlService.createHtmlOutput(generateNoCodesHtml())
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Initial setup function for the developer
 */
function setupScript() {
  try {
    var ownerEmail = Session.getActiveUser().getEmail();
    PropertiesService.getScriptProperties().setProperty('OWNER_EMAIL', ownerEmail);
  } catch (error) {
    console.error('Error in setup:', error);
    throw error;
  }
}

/**
 * Combined initialization function for one-step setup
 */
function initialize() {
  try {
    setupScript();
    createTrigger();
    return "Setup completed successfully!";
  } catch (error) {
    console.error('Error during initialization:', error);
    throw error;
  }
}
