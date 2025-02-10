// Developer-only functions (require permissions)
function updateDates() {
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
      expDate.setDate(expDate.getDate() + 28);
      expDate.setHours(0,0,0,0);
      sheet.getRange(i + 1, 4).setValue(expDate);
    }
  }
}

function createTrigger() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('updateDates')
    .forSpreadsheet(sheet)
    .onEdit()
    .create();
}

// Public web app function
function doGet() {
  // First, ensure all dates are updated
  updateDates();
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  // TODO: Replace with your website URL where users will be redirected when no codes are available
  var redirectURL = "https://yourwebsite.com";
  var ownerEmail = PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL'); // Store email in properties
  var today = new Date();
  today.setHours(0,0,0,0); // Reset time part to compare dates only
  var allRedeemed = true;

  for (var i = 1; i < data.length; i++) { // Skip headers
    var promoCode = data[i][0];
    var status = data[i][1];
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
                             needsUploadDate; // Also update if upload date was just set
    
    if (needsExpirationDate) {
      var expDate = new Date(uploadDate);
      expDate.setDate(expDate.getDate() + 28);
      expDate.setHours(0,0,0,0);
      sheet.getRange(i + 1, 4).setValue(expDate);
      expirationDate = expDate;
    }

    // Ensure dates are compared properly by converting to Date objects
    var currentExpirationDate = new Date(expirationDate);
    currentExpirationDate.setHours(0,0,0,0);

    // Check if the promo code is still valid
    if (status !== "Redeemed" && currentExpirationDate > today) {
      sheet.getRange(i + 1, 2).setValue("Redeemed");

      var appStoreURL = "https://apps.apple.com/redeem?code=" + promoCode;
      var qrCodeURL = "https://quickchart.io/qr?text=" + encodeURIComponent(appStoreURL) + "&size=200";

      return HtmlService.createHtmlOutput(
        `<html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
                background-color: #f8f8f8;
              }
              .container {
                max-width: 500px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              }
              .btn {
                background-color: #007aff;
                color: white;
                padding: 12px 20px;
                font-size: 18px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                margin: 10px 0;
              }
              .btn:hover {
                background-color: #005ecb;
              }
              .qr-container {
                margin-top: 20px;
              }
            </style>
            <script>
              function openAppStore() {
                window.open("${appStoreURL}", "_blank");
              }
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
        </html>`
      ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } else if (status !== "Redeemed" && currentExpirationDate <= today) {
      // Mark expired codes as "Expired"
      sheet.getRange(i + 1, 2).setValue("Expired");
    } else {
      allRedeemed = allRedeemed && true;
    }
  }

  // Notify developer if all codes are redeemed/expired
  if (allRedeemed && sheet.getRange("E1").getValue() !== "Notified") {
    MailApp.sendEmail(ownerEmail, "All Promo Codes Redeemed or Expired", "All promo codes in your Google Sheet have been used or expired.");
    sheet.getRange("E1").setValue("Notified");
  }

  return HtmlService.createHtmlOutput(
    `<html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            background-color: #f8f8f8;
          }
          .container {
            max-width: 400px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
          }
          .msg {
            font-size: 18px;
            color: #333;
          }
        </style>
        <script>
          setTimeout(function() {
            window.location.href = "${redirectURL}";
          }, 5000);
        </script>
      </head>
      <body>
        <div class="container">
          <p class="msg">Sorry, all promo codes have been redeemed or expired.</p>
          <p class="msg">You will be redirected shortly.</p>
          <p><a href="${redirectURL}">Click here if you are not redirected.</a></p>
        </div>
      </body>
    </html>`
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Developer setup function
function setupScript() {
  // Store developer email in script properties
  var ownerEmail = Session.getActiveUser().getEmail();
  PropertiesService.getScriptProperties().setProperty('OWNER_EMAIL', ownerEmail);
}
