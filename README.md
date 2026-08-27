# Wedding Invitation

An elegant digital wedding invitation. The project is split into clean, separate files so markup, styles, and logic are easy to edit independently.

## Project structure

```
wedding/
├── index.html              # Page markup only
├── README.md
└── assets/
    ├── css/
    │   └── styles.css      # All styles (theme tokens, hero, countdown, venue, footer…)
    ├── js/
    │   ├── config.js       # Editable settings (date, venue, calendar)
    │   └── main.js         # Logic: countdown, footer date, map + calendar links
    └── media/
        ├── web_view.mp4      # Hero / split-section background (desktop)
        ├── mobile_view.mp4   # Hero / split-section background (mobile)
        ├── allahm.png        # Arabic blessing calligraphy
        └── venue.jpeg        # Venue photo (Olivia Hall)
```

## What's inside
- **Hero** with couple names, ornamental gold frame, and background video
- **Live countdown** to the big day
- **Arabic invitation text** alongside the countdown
- **Venue** with a bleeding photo background, "Open in Maps" and "Add to Calendar" buttons
- Smooth scroll‑reveal animations

## How to edit
1. **Details** — almost everything lives in **`assets/js/config.js`**:
   - `date` — wedding date & time
   - `durationHours` — event length (used for the calendar event)
   - `venue.name` / `venue.address` / `venue.mapsUrl`
   - `calendarTitle` — the calendar event title
2. **Hero date** — edit the `.hero-date` paragraph directly in `index.html` (static text, not driven by config).
3. **Names** — edit them directly in `index.html` (the `.couple` and `.couple-sm` elements).
4. **Styling / colors** — edit `assets/css/styles.css` (theme colors live in the `:root` block at the top).
5. **Media** — replace the files in `assets/media/` (keep the same filenames, or update the paths in `index.html` / `styles.css`).

## Running locally
Because the page loads separate CSS/JS files, open it through a local server (some browsers block module/file access via `file://`):

```bash
# from the project folder
python3 -m http.server 8000
# then visit http://localhost:8000
```

Opening `index.html` directly by double‑clicking will also work in most browsers.

## Hosting on GitHub Pages
1. Create a new GitHub repo and push this folder to it.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source: Deploy from a branch**,
   pick your branch (e.g. `main`) and the `/ (root)` folder, then **Save**.
4. Your invitation will be live at `https://<username>.github.io/<repo>/`.
