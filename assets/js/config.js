/* ============================================================
   CONFIG  — edit everything here
   ============================================================ */
const CONFIG = {
  // Wedding date & time (local). Format: YEAR, MONTH(1-12), DAY, HOUR(24), MIN
  date: { year:2026, month:9, day:21, hour:20, minute:0 },
  // event duration in hours (for calendar)
  durationHours: 4,
  // Venue
  venue: {
    name:"Olivia Hall - قاعة أوليفيا",
    address:"Talkha, Mansoura, Egypt (طلخا، المنصورة)",
    // paste your Google Maps link here (Share → Copy link)
    mapsUrl:"https://maps.app.goo.gl/kbUDTVFXLdouyDHL8"
  },
  // calendar event title
  calendarTitle:"Wedding of Ahmed and Shorouk - حفل زفاف أحمد وشروق",
  // Google Apps Script web app URL (see scripts/comments-apps-script.gs)
  commentsScriptUrl:"https://script.google.com/macros/s/AKfycbysNoel2gza85GidCXVSoA5lOSuy5Ci-FGOjRcGXApO4e9tILY5-Iohu7i_7Gq0mXf5dA/exec",
  // optional shared secret — must match SECRET in the Apps Script
  commentsSecret:""
};
