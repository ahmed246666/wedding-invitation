/* ============================================================
   CONFIG  — edit everything here
   ============================================================ */
const CONFIG = {
  // Katb Ketab date & time (local). Format: YEAR, MONTH(1-12), DAY, HOUR(24), MIN
  date: { year:2026, month:6, day:26, hour:17, minute:0 },
  // event duration in hours (for calendar)
  durationHours: 5,
  // Venue
  venue: {
    name:"Al-Iman Mosque",
    address:"Kanat Al Sweis, Mansoura Qism 2, El Mansoura, Egypt",
    // paste your Google Maps link here (Share → Copy link)
    mapsUrl:"https://maps.app.goo.gl/erNueTmoqtQAT7cA8"
  },
  // calendar event title
  calendarTitle:"Katb Ketab of Alaa and Mohamed",
  // Google Apps Script web app URL (see scripts/comments-apps-script.gs)
  commentsScriptUrl:"https://script.google.com/macros/s/AKfycbxtHkm-99PuewElGPBFFlbt-VOvzoVf_9SwZmjGiR6Yn8eXr3Bo_0y3XNwC6kYIMsLMkQ/exec",
  // optional shared secret — must match SECRET in the Apps Script
  commentsSecret:""
};
