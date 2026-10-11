// Configuration constants
const CONFIG = {
  EXPIRATION_DAYS: 28,
  // TODO: Replace with your app's display name (shown on the redemption page)
  APP_NAME: "Your App",
  // TODO: Replace with your app website URL (homepage link + empty-state redirect)
  APP_WEBSITE_URL: "https://yourwebsite.com",
  // Optional branding (leave empty to hide)
  APP_LOGO_URL: "",
  APP_BLURB: "",
  LOW_STOCK_THRESHOLD: 10,
  MAX_CLAIMS_PER_VISITOR_PER_DAY: 1,
  CLAIM_COOLDOWN_SECONDS: 60,
  MAX_CLAIMS_PER_MINUTE: 30
};

const COL = {
  CODE: 0,
  STATUS: 1,
  UPLOAD: 2,
  EXPIRATION: 3,
  REDEEMED_AT: 4,
  SOURCE: 5,
  CAMPAIGN: 6,
  VISITOR_ID: 7
};

const PROP = {
  OWNER_EMAIL: "OWNER_EMAIL",
  ALL_REDEEMED_NOTIFIED: "ALL_REDEEMED_NOTIFIED",
  LOW_STOCK_NOTIFIED: "LOW_STOCK_NOTIFIED"
};

const HEADERS = [
  "Promo Code",
  "Status",
  "Upload Date",
  "Expiration Date",
  "Redeemed At",
  "Source",
  "Campaign",
  "Visitor Id"
];

const BOT_UA_SNIPPETS = [
  "bot",
  "spider",
  "crawl",
  "slurp",
  "slackbot",
  "twitterbot",
  "facebookexternalhit",
  "linkedinbot",
  "discordbot",
  "whatsapp",
  "telegrambot",
  "applebot",
  "bingpreview",
  "embedly",
  "quora link preview",
  "pinterest",
  "redditbot",
  "skypeuripreview",
  "vkshare",
  "w3c_validator",
  "preview"
];

/**
 * Ensures header row matches the expected sheet layout
 */
function ensureSheetHeaders_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastCol = Math.max(sheet.getLastColumn(), HEADERS.length);
  var existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  for (var c = 0; c < HEADERS.length; c++) {
    if (existing[c] !== HEADERS[c]) {
      sheet.getRange(1, c + 1).setValue(HEADERS[c]);
    }
  }
}

/**
 * Updates upload and expiration dates for promo codes
 * @throws {Error} If sheet operations fail
 */
function updateDates() {
  try {
    ensureSheetHeaders_();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      var uploadDateRaw = data[i][COL.UPLOAD];
      var expirationDateRaw = data[i][COL.EXPIRATION];

      var uploadDate = new Date(uploadDateRaw);
      var needsUploadDate = !uploadDateRaw || uploadDateRaw === "" || isNaN(uploadDate.getTime());

      if (needsUploadDate) {
        var todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        sheet.getRange(i + 1, COL.UPLOAD + 1).setValue(todayDate);
        uploadDate = todayDate;
      }

      var expirationDate = new Date(expirationDateRaw);
      var needsExpirationDate =
        !expirationDateRaw ||
        expirationDateRaw === "" ||
        isNaN(expirationDate.getTime()) ||
        needsUploadDate;

      if (needsExpirationDate) {
        var expDate = new Date(uploadDate);
        expDate.setDate(expDate.getDate() + CONFIG.EXPIRATION_DAYS);
        expDate.setHours(0, 0, 0, 0);
        sheet.getRange(i + 1, COL.EXPIRATION + 1).setValue(expDate);
      }
    }
  } catch (error) {
    console.error("Error updating dates:", error);
    throw error;
  }
}

/**
 * Creates an onEdit trigger for automatic date updates
 */
function createTrigger() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    ScriptApp.newTrigger("updateDates").forSpreadsheet(sheet).onEdit().create();
  } catch (error) {
    console.error("Error creating trigger:", error);
    throw error;
  }
}

/**
 * Escapes text for safe HTML text content
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeParam_(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

/**
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost|Object} e
 * @returns {string}
 */
function getUserAgent_(e) {
  if (!e || !e.parameter) {
    return "";
  }
  return normalizeParam_(e.parameter.ua || e.parameter.userAgent);
}

/**
 * @param {string} ua
 * @returns {boolean}
 */
function isBotUserAgent_(ua) {
  if (!ua) {
    return false;
  }
  var lower = ua.toLowerCase();
  for (var i = 0; i < BOT_UA_SNIPPETS.length; i++) {
    if (lower.indexOf(BOT_UA_SNIPPETS[i]) !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * Apps Script web apps cannot read Cookie headers; visitor id is passed via
 * query/form and persisted in the browser with localStorage + document.cookie.
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost|Object} e
 * @returns {string}
 */
function getVisitorIdFromRequest_(e) {
  if (!e || !e.parameter) {
    return "";
  }
  return normalizeParam_(e.parameter.visitor_id);
}

/**
 * @returns {boolean} true if under the global per-minute cap
 */
function isGlobalClaimRateAvailable_() {
  var cache = CacheService.getScriptCache();
  var raw = cache.get("claims_per_minute");
  var count = raw ? parseInt(raw, 10) : 0;
  if (isNaN(count)) {
    count = 0;
  }
  return count < CONFIG.MAX_CLAIMS_PER_MINUTE;
}

/**
 * Increments the global claims/minute bucket after a successful assign.
 */
function incrementGlobalClaimRate_() {
  var cache = CacheService.getScriptCache();
  var key = "claims_per_minute";
  var raw = cache.get(key);
  var count = raw ? parseInt(raw, 10) : 0;
  if (isNaN(count)) {
    count = 0;
  }
  cache.put(key, String(count + 1), 60);
}

/**
 * @param {string} visitorId
 * @returns {boolean}
 */
function allowVisitorCooldown_(visitorId) {
  if (!visitorId || CONFIG.CLAIM_COOLDOWN_SECONDS <= 0) {
    return true;
  }
  var cache = CacheService.getScriptCache();
  var key = "cooldown:" + visitorId;
  if (cache.get(key)) {
    return false;
  }
  return true;
}

/**
 * @param {string} visitorId
 */
function markVisitorCooldown_(visitorId) {
  if (!visitorId || CONFIG.CLAIM_COOLDOWN_SECONDS <= 0) {
    return;
  }
  CacheService.getScriptCache().put(
    "cooldown:" + visitorId,
    "1",
    CONFIG.CLAIM_COOLDOWN_SECONDS
  );
}

/**
 * @returns {Date}
 */
function startOfToday_() {
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * @param {Date|string|number} value
 * @returns {Date|null}
 */
function asDate_(value) {
  if (!value && value !== 0) {
    return null;
  }
  var d = new Date(value);
  if (isNaN(d.getTime())) {
    return null;
  }
  return d;
}

/**
 * @param {Array<Array<*>>} data
 * @param {string} visitorId
 * @returns {number}
 */
function countVisitorClaimsToday_(data, visitorId) {
  if (!visitorId) {
    return 0;
  }
  var start = startOfToday_();
  var count = 0;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][COL.VISITOR_ID]) !== visitorId) {
      continue;
    }
    var redeemedAt = asDate_(data[i][COL.REDEEMED_AT]);
    if (redeemedAt && redeemedAt >= start) {
      count++;
    }
  }
  return count;
}

/**
 * @param {Array<Array<*>>} data
 * @param {string} visitorId
 * @returns {string} promo code or empty
 */
function findVisitorClaimToday_(data, visitorId) {
  if (!visitorId) {
    return "";
  }
  var start = startOfToday_();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][COL.VISITOR_ID]) !== visitorId) {
      continue;
    }
    var redeemedAt = asDate_(data[i][COL.REDEEMED_AT]);
    if (redeemedAt && redeemedAt >= start && data[i][COL.CODE]) {
      return String(data[i][COL.CODE]);
    }
  }
  return "";
}

/**
 * @param {string} rowCampaign
 * @param {string} requestedCampaign
 * @returns {boolean}
 */
function campaignMatches_(rowCampaign, requestedCampaign) {
  var row = normalizeParam_(rowCampaign).toLowerCase();
  var want = normalizeParam_(requestedCampaign).toLowerCase();
  if (!want) {
    return !row;
  }
  return row === want;
}

/**
 * @param {string} campaign empty = default pool only; "*" = all pools
 * @returns {number}
 */
function countRemaining_(campaign) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var today = startOfToday_();
  var remaining = 0;
  var allPools = campaign === "*";

  for (var i = 1; i < data.length; i++) {
    var status = data[i][COL.STATUS];
    var expirationDate = asDate_(data[i][COL.EXPIRATION]);
    if (!expirationDate) {
      continue;
    }
    expirationDate.setHours(0, 0, 0, 0);
    if (status === "Redeemed" || status === "Expired") {
      continue;
    }
    if (expirationDate <= today) {
      continue;
    }
    if (!allPools && !campaignMatches_(data[i][COL.CAMPAIGN], campaign)) {
      continue;
    }
    if (!data[i][COL.CODE]) {
      continue;
    }
    remaining++;
  }
  return remaining;
}

/**
 * Marks expired rows and returns whether any non-expired available codes remain (any campaign).
 * @returns {{allRedeemed: boolean, remainingDefaultPool: number}}
 */
function refreshExpiredStatuses_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var today = startOfToday_();
  var availableAnywhere = false;

  for (var i = 1; i < data.length; i++) {
    if (!data[i][COL.CODE]) {
      continue;
    }
    var status = data[i][COL.STATUS];
    var expirationDate = asDate_(data[i][COL.EXPIRATION]);
    if (!expirationDate) {
      continue;
    }
    expirationDate.setHours(0, 0, 0, 0);

    if (status !== "Redeemed" && expirationDate <= today) {
      sheet.getRange(i + 1, COL.STATUS + 1).setValue("Expired");
      status = "Expired";
    }

    if (status !== "Redeemed" && status !== "Expired" && expirationDate > today) {
      availableAnywhere = true;
    }
  }

  return {
    allRedeemed: !availableAnywhere,
    remainingAll: countRemaining_("*")
  };
}

/**
 * @param {number} remaining
 */
function maybeSendLowStockEmail_(remaining) {
  var props = PropertiesService.getScriptProperties();
  var ownerEmail = props.getProperty(PROP.OWNER_EMAIL);
  if (!ownerEmail) {
    return;
  }

  if (remaining >= CONFIG.LOW_STOCK_THRESHOLD) {
    if (props.getProperty(PROP.LOW_STOCK_NOTIFIED)) {
      props.deleteProperty(PROP.LOW_STOCK_NOTIFIED);
    }
    return;
  }

  if (props.getProperty(PROP.LOW_STOCK_NOTIFIED) === "1") {
    return;
  }

  try {
    MailApp.sendEmail(
      ownerEmail,
      "Promo codes running low (" + remaining + " left)",
      "Only " +
        remaining +
        " promo code(s) remain available (threshold: " +
        CONFIG.LOW_STOCK_THRESHOLD +
        "). Add more codes to your sheet when you can."
    );
    props.setProperty(PROP.LOW_STOCK_NOTIFIED, "1");
  } catch (error) {
    console.error("Error sending low-stock email:", error);
  }
}

/**
 * @param {boolean} allRedeemed
 */
function maybeSendAllRedeemedEmail_(allRedeemed) {
  var props = PropertiesService.getScriptProperties();
  var ownerEmail = props.getProperty(PROP.OWNER_EMAIL);
  if (!ownerEmail) {
    return;
  }

  if (!allRedeemed) {
    if (props.getProperty(PROP.ALL_REDEEMED_NOTIFIED)) {
      props.deleteProperty(PROP.ALL_REDEEMED_NOTIFIED);
    }
    return;
  }

  if (props.getProperty(PROP.ALL_REDEEMED_NOTIFIED) === "1") {
    return;
  }

  try {
    MailApp.sendEmail(
      ownerEmail,
      "All Promo Codes Redeemed or Expired",
      "All promo codes in your Google Sheet have been used or expired."
    );
    props.setProperty(PROP.ALL_REDEEMED_NOTIFIED, "1");
  } catch (error) {
    console.error("Error sending all-redeemed email:", error);
  }
}

/**
 * @param {string} visitorId
 * @param {string} src
 * @param {string} campaign
 * @returns {{ok: boolean, code?: string, reason?: string}}
 */
function claimPromoCode_(visitorId, src, campaign) {
  if (!visitorId) {
    return { ok: false, reason: "missing_visitor" };
  }

  if (!allowVisitorCooldown_(visitorId)) {
    return { ok: false, reason: "cooldown" };
  }

  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(30000)) {
    return { ok: false, reason: "busy" };
  }

  try {
    ensureSheetHeaders_();
    updateDates();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();

    var existing = findVisitorClaimToday_(data, visitorId);
    if (existing) {
      return { ok: true, code: existing };
    }

    if (countVisitorClaimsToday_(data, visitorId) >= CONFIG.MAX_CLAIMS_PER_VISITOR_PER_DAY) {
      return { ok: false, reason: "daily_limit" };
    }

    if (!isGlobalClaimRateAvailable_()) {
      return { ok: false, reason: "rate_limit" };
    }

    var today = startOfToday_();
    var now = new Date();

    for (var i = 1; i < data.length; i++) {
      var promoCode = data[i][COL.CODE];
      if (!promoCode) {
        continue;
      }
      var status = data[i][COL.STATUS];
      var expirationDate = asDate_(data[i][COL.EXPIRATION]);
      if (!expirationDate) {
        continue;
      }
      expirationDate.setHours(0, 0, 0, 0);

      if (status === "Redeemed") {
        continue;
      }

      if (expirationDate <= today) {
        sheet.getRange(i + 1, COL.STATUS + 1).setValue("Expired");
        continue;
      }

      if (!campaignMatches_(data[i][COL.CAMPAIGN], campaign)) {
        continue;
      }

      var row = i + 1;
      sheet.getRange(row, COL.STATUS + 1).setValue("Redeemed");
      sheet.getRange(row, COL.REDEEMED_AT + 1).setValue(now);
      sheet.getRange(row, COL.SOURCE + 1).setValue(src);
      sheet.getRange(row, COL.VISITOR_ID + 1).setValue(visitorId);
      // Preserve pre-assigned campaign on the row; if blank and request has one, record it
      if (!normalizeParam_(data[i][COL.CAMPAIGN]) && campaign) {
        sheet.getRange(row, COL.CAMPAIGN + 1).setValue(campaign);
      }

      incrementGlobalClaimRate_();
      markVisitorCooldown_(visitorId);

      var remaining = countRemaining_("*");
      maybeSendLowStockEmail_(remaining);
      var refresh = refreshExpiredStatuses_();
      maybeSendAllRedeemedEmail_(refresh.allRedeemed);

      return { ok: true, code: String(promoCode) };
    }

    var emptyRefresh = refreshExpiredStatuses_();
    maybeSendAllRedeemedEmail_(emptyRefresh.allRedeemed);
    return { ok: false, reason: "empty" };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Shared CSS for the GitHub project footer
 * @returns {string} CSS rules
 */
function githubLinkCss() {
  return `
        .github-link {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e5e5e5;
          font-size: 13px;
          color: #666;
        }
        .github-link a {
          color: #007aff;
          text-decoration: none;
        }
        .github-link a:hover {
          text-decoration: underline;
        }`;
}

/**
 * Shared HTML for the GitHub project footer
 * @returns {string} Footer markup
 */
function githubLinkHtml() {
  var githubUrl = "https://github.com/wassupdoc/iospromocodetracker";
  return `
        <div class="github-link">
          <p>
            Want to share your own App Store promo codes?<br>
            <a href="${githubUrl}"
               target="_blank"
               rel="noopener noreferrer">
              Get this free, open-source promo code tracker on GitHub →
            </a>
          </p>
        </div>`;
}

/**
 * @returns {string}
 */
function sharedPageCss_() {
  return `
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8f8f8; }
        .container { max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
        .btn { background-color: #007aff; color: white; padding: 12px 20px; font-size: 18px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px 0; }
        .btn:hover { background-color: #005ecb; }
        .msg { font-size: 18px; color: #333; }
        .blurb { font-size: 15px; color: #555; margin: 8px 0 16px; }
        .logo { max-width: 96px; max-height: 96px; margin: 0 auto 12px; display: block; }
        ${githubLinkCss()}`;
}

/**
 * @returns {string}
 */
function brandingHtml_() {
  var parts = [];
  if (CONFIG.APP_LOGO_URL) {
    parts.push(
      '<img class="logo" src="' +
        escapeHtml(CONFIG.APP_LOGO_URL) +
        '" alt="' +
        escapeHtml(CONFIG.APP_NAME) +
        ' logo">'
    );
  }
  if (CONFIG.APP_BLURB) {
    parts.push('<p class="blurb">' + escapeHtml(CONFIG.APP_BLURB) + "</p>");
  }
  return parts.join("\n        ");
}

/**
 * Client script: persist visitor id (localStorage + cookie) and sync into URL/forms.
 * Apps Script cannot read Cookie request headers.
 * @returns {string}
 */
function visitorClientScript_() {
  return `
        function pctEnsureVisitorId() {
          var key = "pct_visitor_id";
          var id = null;
          try { id = localStorage.getItem(key); } catch (e) {}
          if (!id) {
            try {
              var match = document.cookie.match(/(?:^|; )pct_visitor_id=([^;]+)/);
              if (match) { id = decodeURIComponent(match[1]); }
            } catch (e2) {}
          }
          if (!id) {
            if (window.crypto && crypto.randomUUID) {
              id = crypto.randomUUID();
            } else {
              id = "v-" + String(Date.now()) + "-" + Math.random().toString(36).slice(2, 12);
            }
          }
          try { localStorage.setItem(key, id); } catch (e3) {}
          try {
            document.cookie = "pct_visitor_id=" + encodeURIComponent(id) +
              "; path=/; max-age=31536000; SameSite=Lax";
          } catch (e4) {}
          return id;
        }
        function pctFillClaimForm() {
          // Do not location.replace/reload here: Apps Script serves HTML in an
          // iframe, and rewriting pathname blanks the page. Visitor id is sent
          // on POST via the hidden field (and optional ?visitor_id= on share URLs).
          var id = pctEnsureVisitorId();
          var visitorField = document.getElementById("visitor_id");
          var uaField = document.getElementById("ua");
          if (visitorField) { visitorField.value = id; }
          if (uaField) { uaField.value = navigator.userAgent || ""; }
          return id;
        }`;
}

/**
 * @param {string} src
 * @param {string} campaign
 * @returns {string}
 */
function generateLandingHtml(src, campaign) {
  var htmlEscapedAppName = escapeHtml(String(CONFIG.APP_NAME));
  var actionUrl = "";
  try {
    actionUrl = ScriptApp.getService().getUrl() || "";
  } catch (e) {
    actionUrl = "";
  }
  var formAction = actionUrl ? escapeHtml(actionUrl) : "";

  return `<html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        ${sharedPageCss_()}
      </style>
      <script>
        ${visitorClientScript_()}
        document.addEventListener("DOMContentLoaded", function() {
          pctFillClaimForm();
        });
      </script>
    </head>
    <body>
      <div class="container">
        ${brandingHtml_()}
        <h2>Get your ${htmlEscapedAppName} promo code</h2>
        <p class="msg">Tap below to reveal a one-time App Store promo code.</p>
        <form method="post" action="${formAction}" target="_top">
          <input type="hidden" name="visitor_id" id="visitor_id" value="">
          <input type="hidden" name="ua" id="ua" value="">
          <input type="hidden" name="src" value="${escapeHtml(src)}">
          <input type="hidden" name="campaign" value="${escapeHtml(campaign)}">
          <button class="btn" type="submit">Get my promo code</button>
        </form>
        ${githubLinkHtml()}
      </div>
    </body>
  </html>`;
}

/**
 * Generates HTML for code redemption page
 * @param {string} promoCode - The promo code to redeem
 * @returns {string} HTML content
 */
function generateRedemptionHtml(promoCode) {
  var appStoreURL = "https://apps.apple.com/redeem?code=" + encodeURIComponent(promoCode);
  var qrCodeURL =
    "https://quickchart.io/qr?text=" + encodeURIComponent(appStoreURL) + "&size=200";
  var promoCodeText = String(promoCode);
  var htmlEscapedPromoCode = escapeHtml(promoCodeText);
  var htmlEscapedAppName = escapeHtml(String(CONFIG.APP_NAME));
  var jsEscapedPromoCode = promoCodeText
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");

  return `<html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        ${sharedPageCss_()}
        .btn-secondary { background-color: #f2f2f2; color: #007aff; padding: 8px 14px; font-size: 14px; border: 1px solid #d0d0d0; border-radius: 5px; cursor: pointer; margin-left: 8px; }
        .btn-secondary:hover { background-color: #e8e8e8; }
        .code-row { margin: 16px 0 8px; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px; }
        .promo-code { font-family: Menlo, Monaco, Consolas, monospace; font-size: 18px; letter-spacing: 0.5px; background: #f5f5f5; padding: 8px 12px; border-radius: 5px; }
        .copy-status { min-height: 1.2em; font-size: 13px; color: #666; margin: 0 0 8px; }
        .qr-container { margin-top: 20px; }
        .app-website-link { margin-top: 20px; font-size: 14px; }
        .app-website-link a { color: #007aff; text-decoration: none; }
        .app-website-link a:hover { text-decoration: underline; }
      </style>
      <script>
        ${visitorClientScript_()}
        function copyPromoCode() {
          var code = "${jsEscapedPromoCode}";
          var status = document.getElementById("copy-status");
          function showCopied() {
            if (status) { status.textContent = "Copied!"; }
          }
          function showFailed() {
            if (status) { status.textContent = "Could not copy. Select the code manually."; }
          }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(showCopied).catch(showFailed);
            return;
          }
          var input = document.createElement("input");
          input.value = code;
          document.body.appendChild(input);
          input.select();
          try {
            document.execCommand("copy") ? showCopied() : showFailed();
          } catch (e) {
            showFailed();
          }
          document.body.removeChild(input);
        }
        document.addEventListener("DOMContentLoaded", function() {
          pctEnsureVisitorId();
        });
      </script>
    </head>
    <body>
      <div class="container">
        ${brandingHtml_()}
        <h2>Your ${htmlEscapedAppName} Promo Code</h2>
        <p>Your code:</p>
        <div class="code-row">
          <code class="promo-code" id="promo-code">${htmlEscapedPromoCode}</code>
          <button type="button" class="btn-secondary" onclick="copyPromoCode()">Copy</button>
        </div>
        <p class="copy-status" id="copy-status" aria-live="polite"></p>
        <a class="btn" href="${appStoreURL}" target="_blank" rel="noopener noreferrer">Redeem Code</a>
        <div class="qr-container">
          <p>Or scan the QR code:</p>
          <img src="${qrCodeURL}" alt="QR Code">
        </div>
        <div class="app-website-link">
          <a href="${escapeHtml(CONFIG.APP_WEBSITE_URL)}" target="_blank" rel="noopener noreferrer">Visit the app website →</a>
        </div>
        ${githubLinkHtml()}
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
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        ${sharedPageCss_()}
        .container { max-width: 400px; }
      </style>
      <script>
        setTimeout(function() { window.location.href = "${escapeHtml(CONFIG.APP_WEBSITE_URL)}"; }, 5000);
      </script>
    </head>
    <body>
      <div class="container">
        ${brandingHtml_()}
        <p class="msg">Sorry, all promo codes have been redeemed or expired.</p>
        <p class="msg">You will be redirected shortly.</p>
        <p><a href="${escapeHtml(CONFIG.APP_WEBSITE_URL)}">Click here if you are not redirected.</a></p>
        ${githubLinkHtml()}
      </div>
    </body>
  </html>`;
}

/**
 * @param {string} title
 * @param {string} message
 * @returns {string}
 */
function generateMessageHtml_(title, message) {
  return `<html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        ${sharedPageCss_()}
        .container { max-width: 400px; }
      </style>
    </head>
    <body>
      <div class="container">
        ${brandingHtml_()}
        <h2>${escapeHtml(title)}</h2>
        <p class="msg">${escapeHtml(message)}</p>
        <p><a class="btn" href="${escapeHtml(CONFIG.APP_WEBSITE_URL)}" target="_blank" rel="noopener noreferrer">Visit the app website</a></p>
        ${githubLinkHtml()}
      </div>
    </body>
  </html>`;
}

/**
 * @returns {string}
 */
function generateBotHtml_() {
  return generateMessageHtml_(
    "Open in your browser",
    "This promo code link needs to be opened in a regular web browser (not a link preview)."
  );
}

/**
 * @param {string} reason
 * @param {string} visitorId
 * @param {string} src
 * @param {string} campaign
 * @returns {string}
 */
function generateLimitHtml(reason, visitorId, src, campaign) {
  if (reason === "rate_limit" || reason === "busy") {
    return generateMessageHtml_(
      "Please try again shortly",
      "We're handling a lot of requests right now. Wait a moment and try again."
    );
  }
  if (reason === "cooldown") {
    return generateMessageHtml_(
      "Please wait a moment",
      "You recently requested a code. Wait about a minute, then try again."
    );
  }
  if (reason === "daily_limit") {
    ensureSheetHeaders_();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var existing = findVisitorClaimToday_(data, visitorId);
    if (existing) {
      return generateRedemptionHtml(existing);
    }
    return generateMessageHtml_(
      "Code already claimed",
      "This browser already received a promo code today. Come back tomorrow for another, or redeem the code you already have."
    );
  }
  if (reason === "missing_visitor") {
    return generateLandingHtml(src, campaign);
  }
  return generateNoCodesHtml();
}

/**
 * @param {string} html
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function htmlOutput_(html) {
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(
    HtmlService.XFrameOptionsMode.ALLOWALL
  );
}

/**
 * Handles web app GET requests — never assigns a code.
 * @param {GoogleAppsScript.Events.DoGet} e
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function doGet(e) {
  try {
    e = e || { parameter: {} };
    var ua = getUserAgent_(e);
    if (isBotUserAgent_(ua)) {
      return htmlOutput_(generateBotHtml_());
    }

    updateDates();
    var src = normalizeParam_(e.parameter.src);
    var campaign = normalizeParam_(e.parameter.campaign);
    var visitorId = getVisitorIdFromRequest_(e);

    var refresh = refreshExpiredStatuses_();
    maybeSendLowStockEmail_(countRemaining_("*"));
    maybeSendAllRedeemedEmail_(refresh.allRedeemed);

    if (visitorId) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var data = sheet.getDataRange().getValues();
      var existing = findVisitorClaimToday_(data, visitorId);
      if (existing) {
        return htmlOutput_(generateRedemptionHtml(existing));
      }
    }

    if (refresh.allRedeemed) {
      return htmlOutput_(generateNoCodesHtml());
    }

    // Pool empty for this campaign but other campaigns may still have codes
    if (countRemaining_(campaign) === 0) {
      return htmlOutput_(generateNoCodesHtml());
    }

    return htmlOutput_(generateLandingHtml(src, campaign));
  } catch (error) {
    console.error("Error in doGet:", error);
    return htmlOutput_(generateNoCodesHtml());
  }
}

/**
 * Handles claim POST — assigns a code behind LockService.
 * @param {GoogleAppsScript.Events.DoPost} e
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function doPost(e) {
  try {
    e = e || { parameter: {} };
    var ua = getUserAgent_(e);
    if (isBotUserAgent_(ua)) {
      return htmlOutput_(generateBotHtml_());
    }

    var visitorId = getVisitorIdFromRequest_(e);
    var src = normalizeParam_(e.parameter.src);
    var campaign = normalizeParam_(e.parameter.campaign);

    var result = claimPromoCode_(visitorId, src, campaign);
    if (result.ok) {
      return htmlOutput_(generateRedemptionHtml(result.code));
    }
    return htmlOutput_(generateLimitHtml(result.reason, visitorId, src, campaign));
  } catch (error) {
    console.error("Error in doPost:", error);
    return htmlOutput_(generateNoCodesHtml());
  }
}

/**
 * Initial setup function for the developer
 */
function setupScript() {
  try {
    ensureSheetHeaders_();
    var ownerEmail = Session.getActiveUser().getEmail();
    PropertiesService.getScriptProperties().setProperty(PROP.OWNER_EMAIL, ownerEmail);
  } catch (error) {
    console.error("Error in setup:", error);
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
    console.error("Error during initialization:", error);
    throw error;
  }
}
