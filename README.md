# Rizwan Haneef & Faimyz Fathima Aji — Nikah Invitation

Static site (HTML, CSS, vanilla JS). No build step — deploy the folder as-is.

## Nikah
Saturday, 31 October 2026 · 11:00 AM IST · Grand Arena Convention Centre, Ettumanoor

## Page flow
Opening gate → Hero → Bismillah → Countdown → Groom & Bride → Quran quote → Nikah event → Written in Faith → Our Moments (gallery + lightbox) → Wishes Wall → RSVP* → Best wishes → Contact* → Footer
(*appear only when configured — see below)

## Before going live
1. **Photos** — replace files in `assets/images/` (keep names): `couple-opening.jpg` (gate), `couple-hero.jpg`, `groom.jpg`, `bride.jpg`, `gallery-01…03.jpg`. The story photo reuses `gallery-02.jpg`.
2. **Domain** — in `index.html` replace every `https://your-domain.com` (og:url, og:image, twitter:image, canonical, schema).
3. **Firebase (Wishes Wall + RSVP)** — follow `FIREBASE_SETUP_GUIDE.md`, then fill `js/firebase-config.js`.
4. **Contact / RSVP / social** — fill the empty values in `js/config.js` (`contact`, `rsvp`, `social`). Anything left empty is hidden; nothing is invented.
5. **Story wording** — "Written in Faith" in `index.html` (`#our-story`) is neutral placeholder text; replace with the couple's own words when ready.

## Where things live
- Countdown target, contact, RSVP, social, wishes settings: `js/config.js`
- Colours: `:root` in `css/style.css` (burgundy `#7C1F35`, antique gold `#9A812D`, ivory `#FFFDF8`)
- Gate photo visibility: `.gate-overlay` (≈20–35% veil) and the "Gate legibility" text-shadow block at the end of `css/style.css`
- Music: `assets/music.mp3` — tries to play on load, otherwise starts on the first tap / "Open Invitation"
