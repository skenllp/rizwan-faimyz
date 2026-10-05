/**
 * ============================================================
 *  FIREBASE — Wishes Wall + RSVP
 *  Project: rizwan-faimyz (Realtime Database, Singapore).
 *  If these values are ever emptied, the site still works; the
 *  Wishes Wall shows "can't send right now" and RSVP stays hidden.
 * ============================================================
 */
var firebaseConfig = {
  apiKey: "AIzaSyAdBFB0zeLcKTC19AT_n8ppC3rJmcVSu1w",
  authDomain: "rizwan-faimyz.firebaseapp.com",
  databaseURL: "https://rizwan-faimyz-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rizwan-faimyz",
  storageBucket: "rizwan-faimyz.firebasestorage.app",
  messagingSenderId: "263005001307",
  appId: "1:263005001307:web:afa57173cfaea8aace517e"
};

window.FIREBASE_READY = false;
(function () {
  if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
    console.info('[Firebase] Not configured — add your credentials in js/firebase-config.js');
    return;
  }
  if (typeof firebase === 'undefined') {
    console.warn('[Firebase] SDK did not load (offline or blocked).');
    return;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    window.FIREBASE_READY = true;
  } catch (err) {
    console.error('[Firebase] Initialization error:', err);
  }
})();
