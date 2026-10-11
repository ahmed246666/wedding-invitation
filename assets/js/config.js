/* ============================================================
   CONFIG  — edit everything here
   ============================================================ */
const CONFIG = {
  // Katb Ketab date & time (local). Format: YEAR, MONTH(1-12), DAY, HOUR(24), MIN
  date: { year:2026, month:10, day:16, hour:17, minute:0 },
  // event duration in hours (for calendar)
  durationHours: 4,
  // Venue
  venue: {
    name:"Villa V",
    address:"Ring Rd, Hai El Gamaa, Mansoura",
    // paste your Google Maps link here (Share → Copy link)
    mapsUrl:"https://www.google.com/maps/place/Vila+v/@31.0316805,31.3517597,17z/data=!3m1!4b1!4m6!3m5!1s0x14f79f001b2321c9:0x3f3ac6a173ae964a!8m2!3d31.0316805!4d31.3517597!16s%2Fg%2F11w24d1x8c?entry=ttu&g_ep=EgoyMDI2MTAwNy4wIKXMDSoASAFQAw%3D%3D"
  },
  // calendar event title
  calendarTitle:"Katb Ketab of Sherif and Mahy",
  // Google Apps Script web app URL (see scripts/comments-apps-script.gs)
  commentsScriptUrl:"https://script.google.com/macros/s/AKfycbysNoel2gza85GidCXVSoA5lOSuy5Ci-FGOjRcGXApO4e9tILY5-Iohu7i_7Gq0mXf5dA/exec",
  // optional shared secret — must match SECRET in the Apps Script
  commentsSecret:"",
  // Auto-scroll time per section in milliseconds (0 to disable)
  autoScrollDelay: 5500
};
