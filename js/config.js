/**
 * ============================================================
 *  WEDDING CONFIGURATION — RIZWAN HANEEF & FAIMYZ FATHIMA AJI
 *  Used by js/countdown.js, js/main.js (music, wishes, RSVP,
 *  contact, footer links). Page text and meta tags live in
 *  index.html.
 *
 *  Anything left as '' is simply hidden on the site.
 * ============================================================
 */
window.WEDDING_CONFIG = {
  groom: { firstName: 'Rizwan', fullName: 'Rizwan Haneef' },
  bride: { firstName: 'Faimyz', fullName: 'Faimyz Fathima Aji' },

  /* Nikah — India Standard Time (+05:30) */
  countdown: {
    nikah: { label: 'Nikah Ceremony', target: '2026-10-31T11:00:00+05:30' },
  },

  event: {
    title: 'Nikah Ceremony',
    venue: 'Grand Arena Convention Centre',
    place: 'Ettumanoor',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Grand+Arena+Convention+Centre+Ettumanoor',
  },

  /* Replace these files in assets/images/ (same names) to change photos */
  images: {
    opening: 'assets/images/couple-opening.jpg',
    hero: 'assets/images/couple-hero.jpg',
    groom: 'assets/images/groom.jpg',
    bride: 'assets/images/bride.jpg',
    gallery: ['gallery-01.jpg', 'gallery-02.jpg', 'gallery-03.jpg'],
  },

  music: { src: 'assets/music.mp3', volume: 0.45 },

  /* ── CONTACT SECTION ─────────────────────────────────────────
     Fill in real details to show the section. Empty = hidden.
     phone    : digits with country code, e.g. '+91XXXXXXXXXX'
     whatsapp : digits only with country code, e.g. '91XXXXXXXXXX'   */
  contact: {
    people: [
      { label: "Groom's Family", phone: '', whatsapp: '' },
      { label: "Bride's Family", phone: '', whatsapp: '' },
    ],
    email: '',
  },

  /* ── RSVP ────────────────────────────────────────────────────
     The RSVP section appears only when at least one channel exists:
       1) Firebase configured (js/firebase-config.js) → saved to /rsvps
       2) sheetsUrl : a Google Apps Script web-app URL
       3) rsvpWhatsapp : digits only → opens a pre-filled WhatsApp message */
  rsvp: { sheetsUrl: '', whatsapp: '' },

  /* ── FOOTER LINKS (map is always shown; others only if filled) ── */
  social: { instagram: '', whatsapp: '' },

  /* ── WISHES WALL ─────────────────────────────────────────────
     adminPassword: leave '' to disable the on-page admin tools.
     (This is a client-side convenience, not real security — see
     FIREBASE_SETUP_GUIDE.md. Deleting from the Firebase console
     is the safest way to moderate.)                              */
  wishes: { pageSize: 5, cooldownSeconds: 30 },
  admin: { password: '' },
};
