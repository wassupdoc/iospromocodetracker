function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var redirectURL = "https://your-redirect-site.com"; // Change to your custom redirect URL
  var ownerEmail = Session.getActiveUser().getEmail();
  var today = new Date();
  var allRedeemed = true;

  for (var i = 1; i < data.length; i++) { // Skip headers
    var promoCode = data[i][0];
    var status = data[i][1];
    var uploadDate = data[i][2];
    var expirationDate = data[i][3];

    // If no expiration date, set it to 28 days after upload
    if (!expirationDate && uploadDate) {
      var expDate = new Date(uploadDate);
      expDate.setDate(expDate.getDate() + 28);
      sheet.getRange(i + 1, 4).setValue(expDate);
      expirationDate = expDate;
    }

    // Check if the promo code is still valid
    if (status !== "Redeemed" && expirationDate > today) {
      sheet.getRange(i + 1, 2).setValue("Redeemed");

      var appStoreURL = "https://apps.apple.com/redeem?code=" + promoCode;
      var qrCodeURL = "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" + encodeURIComponent(appStoreURL);

      return HtmlService.createHtmlOutput(
        `<html>
          <head>
            <meta http-equiv="refresh" content="0; url='${appStoreURL}'" />
          </head>
          <body>
            <p>Scan the QR code or <a href="${appStoreURL}">click here</a> to redeem.</p>
            <img src="${qrCodeURL}" alt="QR Code">
          </body>
        </html>`
      ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } else if (status !== "Redeemed" && expirationDate <= today) {
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
        <script>
          setTimeout(function() {
            window.location.href = "${redirectURL}";
          }, 5000);
        </script>
      </head>
      <body>
        <p>Sorry, all promo codes have been redeemed or expired.</p>
        <p>You will be redirected shortly. If not, <a href="${redirectURL}">click here</a>.</p>
      </body>
    </html>`
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
