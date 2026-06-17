/**
 * Wedding comment form — Google Apps Script backend
 *
 * Setup (one time, ~10 minutes):
 * 1. Create a Google Sheet with header row: Timestamp | Name | Message
 * 2. Extensions → Apps Script → paste this entire file
 * 3. Set SECRET below (optional) and match it in assets/js/config.js → commentsSecret
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the web app URL into assets/js/config.js → commentsScriptUrl
 */

const SECRET = ''; // optional — leave empty to disable, or set a passphrase

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (SECRET && data.secret !== SECRET) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
    }

    if (data.website) {
      return jsonResponse({ success: true });
    }

    const message = (data.message || '').trim();
    if (!message) {
      return jsonResponse({ success: false, error: 'Message required' }, 400);
    }

    const name = (data.name || '').trim();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([new Date(), name, message]);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err) }, 500);
  }
}

function jsonResponse(obj, code) {
  const output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  // Apps Script ignores HTTP status codes on web apps; error field is used client-side
  return output;
}
