function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var redirectURL = "https://your-redirect-site.com"; // Change this to your desired redirect URL
  var ownerEmail = Session.getActiveUser().getEmail(); // Get the sheet owner's email
  var allRedeemed = true; // Track if all codes are redeemed

  for (var i = 1; i < data.length; i++) { // Start from row 2 (skip headers)
    if (data[i][1] !== "Redeemed") { // Check if status is not "Redeemed"
      var promoCode = data[i][0]; // Get the promo code
      sheet.getRange(i + 1, 2).setValue("Redeemed"); // Mark as Redeemed

      // If new codes are added, reset the "Notified" flag
      sheet.getRange("C1").setValue(""); 

      var appStoreURL = "https://apps.apple.com/redeem?code=" + promoCode;

      return HtmlService.createHtmlOutput(
        `<html>
          <head>
            <meta http-equiv="refresh" content="0; url='${appStoreURL}'" />
          </head>
          <body>
            <p>If not redirected, <a href="${appStoreURL}">click here</a>.</p>
          </body>
        </html>`
      ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } else {
      allRedeemed = allRedeemed && true; // Continue checking
    }
  }
  // If all codes are redeemed and email wasn't sent before
  if (allRedeemed && sheet.getRange("C1").getValue() !== "Notified") {
    MailApp.sendEmail(ownerEmail, "All Promo Codes Redeemed", "All promo codes in your Google Sheet have been redeemed.");
    sheet.getRange("C1").setValue("Notified"); // Prevent multiple notifications
  }

  // Show message before redirecting
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
        <p>Sorry, all promo codes have been redeemed.</p>
        <p>You will be redirected shortly. If not, <a href="${redirectURL}">click here</a>.</p>
      </body>
    </html>`
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
