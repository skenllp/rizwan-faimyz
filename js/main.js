// ===== MAIN JS =====
(function() {
  'use strict';

  var CFG = window.WEDDING_CONFIG || {};

  // ===== REAL VIEWPORT HEIGHT FIX (iOS Safari address-bar bug) =====
  // iOS Safari's 100vh/100dvh doesn't reliably match the true visible
  // viewport on some iPhones, leaving a white gap below fixed elements
  // like the gate. We measure the real height with JS and expose it as
  // a CSS variable that the gate/body use instead.
  function setRealViewportHeight() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }
  setRealViewportHeight();
  window.addEventListener('resize', setRealViewportHeight);
  window.addEventListener('orientationchange', setRealViewportHeight);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setRealViewportHeight);
  }

  // ===== BACKGROUND MUSIC =====
  // Exposed on the outer scope so initGate() can call it directly from
  // the "Open Invitation" tap handler. Android Chrome is strict about
  // audio.play() needing to run inside the actual user-gesture call
  // stack — relying only on a bubbled document-level listener isn't
  // always reliable there, so we call this straight from the button too.
  var startMusicOnInteraction = function(){};

  function initMusic() {
    var audio     = document.getElementById('bg-music');
    var muteBtn   = document.getElementById('mute-btn');
    var iconSound = document.getElementById('icon-sound');
    var iconMuted = document.getElementById('icon-muted');
    if (!audio || !muteBtn) return;

    var musicCfg = CFG.music || {};
    audio.volume = musicCfg.volume != null ? musicCfg.volume : 0.45;
    var started = false;

    // Try immediate autoplay (allowed by some browsers); otherwise the
    // first tap / scroll / the "Open Invitation" button starts it.
    window.addEventListener('load', function() {
      var p = audio.play();
      if (p && typeof p.then === 'function') {
        p.then(function() { started = true; }).catch(function() {});
      }
    });

    function setMutedState(muted) {
      if (muted) {
        audio.pause();
        iconSound.style.display = 'none';
        iconMuted.style.display = '';
        muteBtn.classList.add('muted');
        muteBtn.setAttribute('aria-label', 'Unmute music');
      } else {
        audio.play().catch(function(){});
        iconSound.style.display = '';
        iconMuted.style.display = 'none';
        muteBtn.classList.remove('muted');
        muteBtn.setAttribute('aria-label', 'Mute music');
      }
    }

    function startOnInteraction() {
      if (!started) {
        started = true;
        var playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function() {
            // Autoplay was blocked even on this gesture; allow a later
            // gesture to retry instead of staying stuck as "started".
            started = false;
          });
        }
      }
    }
    startMusicOnInteraction = startOnInteraction;

    document.addEventListener('click',      startOnInteraction, { once: true });
    document.addEventListener('scroll',     startOnInteraction, { once: true });
    document.addEventListener('touchstart', startOnInteraction, { once: true });

    muteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!started) { startOnInteraction(); return; }
      setMutedState(!audio.paused);
    });
  }

  // ===== OPENING GATE (click-to-enter) =====
  function initGate() {
    var gate     = document.getElementById('gate');
    var enterBtn = document.getElementById('gate-open-btn');
    if (!gate || !enterBtn) return;

    var opened = false;

    // Prevent scroll and touch events while gate is active
    function preventScroll(e) {
      if (!opened && document.body.classList.contains('gate-active')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    // Add scroll prevention listeners
    document.addEventListener('scroll', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('wheel', preventScroll, { passive: false });

    function openGate() {
      if (opened) return;
      opened = true;

      // Call this synchronously, inside the same tap handler, so Android
      // Chrome counts it as a genuine user gesture for audio.play().
      startMusicOnInteraction();

      gate.classList.add('gate-closing');
      document.body.classList.remove('gate-active');
      document.body.classList.add('page-loaded');
      
      // Restore scroll on body
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.touchAction = '';

      // Remove scroll prevention listeners
      document.removeEventListener('scroll', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('wheel', preventScroll);

      window.setTimeout(function() {
        gate.classList.add('gate-hidden');
        gate.setAttribute('aria-hidden', 'true');
      }, 1100);
    }

    enterBtn.addEventListener('click', openGate);
    enterBtn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGate();
      }
    });
  }

  // ===== MOBILE NAV TOGGLE =====
  function initMobileNav() {
    var burger   = document.querySelector('.nav-burger');
    var navLinks = document.querySelector('.nav-links');
    if (!burger || !navLinks) return;

    burger.addEventListener('click', function() {
      navLinks.classList.toggle('open');
      burger.classList.toggle('active');
    });
  }

  // ===== INTERSECTION OBSERVER FOR SECTION TRACKING =====
  function initSectionTracking() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (!navLinks.length) return;

    var sectionObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function(link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(function(s) { sectionObserver.observe(s); });
  }

  // ===== LIGHTBOX (gallery) =====
  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var lbImg    = document.getElementById('lightbox-img');
    var lbClose  = document.getElementById('lightbox-close');
    if (!lightbox || !lbImg) return;

    document.querySelectorAll('.gallery-item').forEach(function(item) {
      var img = item.querySelector('img');
      if (!img) return;
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Open photo: ' + (img.getAttribute('alt') || 'gallery photo'));
      function openLightbox() {
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt || 'Full-size photo';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      item.addEventListener('click', openLightbox);
      item.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }


  // ===== SMALL HELPERS =====
  function cleanDigits(v)  { return String(v || '').replace(/[^\d]/g, ''); }
  function cleanPhone(v)   { return String(v || '').replace(/[^\d+]/g, ''); }
  function safeUrl(v) {
    v = String(v || '').trim();
    return /^https?:\/\//i.test(v) ? v : '';
  }
  function storageGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function storageSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function getDatabase() {
    if (!window.FIREBASE_READY || typeof firebase === 'undefined') return null;
    try { return firebase.database(); } catch (e) { return null; }
  }

  // ===== WISHES WALL WITH FIREBASE =====
  function initWishesWall() {
    var form          = document.getElementById('wishesForm');
    var wishesDisplay = document.getElementById('wishesDisplay');
    var wishesList    = document.getElementById('wishesList');
    var wishesCount   = document.getElementById('wishesCount');
    var statusEl      = document.getElementById('wishesStatus');
    var feedbackEl    = document.getElementById('wishesFeedback');
    var charCount     = document.getElementById('wishesCharCount');
    var viewMoreContainer = document.getElementById('viewMoreContainer');
    var viewMoreBtn   = document.getElementById('viewMoreBtn');
    if (!form || !wishesDisplay || !wishesList) return;

    var wishCfg  = CFG.wishes || {};
    var displayLimit = wishCfg.pageSize || 5;
    var cooldownMs   = (wishCfg.cooldownSeconds != null ? wishCfg.cooldownSeconds : 30) * 1000;
    var allWishes = [];
    var showingAll = false;
    var database = getDatabase();

    // ── Admin mode ────────────────────────────────────────────
    // Add ?admin=1 to the URL and enter the password from js/config.js
    // (admin.password). If no password is configured, admin is disabled.
    var isAdmin = false;
    (function checkAdminMode() {
      var params = new URLSearchParams(window.location.search);
      if (params.get('admin') !== '1') return;
      var configured = (CFG.admin && CFG.admin.password) || '';
      if (!configured) return;
      var authed = false;
      try { authed = window.sessionStorage.getItem('wishesAdminAuthed') === 'true'; } catch (e) {}
      if (authed) { isAdmin = true; return; }
      var entered = window.prompt('Admin password:');
      if (entered === configured) {
        try { window.sessionStorage.setItem('wishesAdminAuthed', 'true'); } catch (e) {}
        isAdmin = true;
      } else if (entered !== null) {
        window.alert('Incorrect password.');
      }
    })();
    if (isAdmin) {
      var adminBadge = document.getElementById('wishesAdminBadge');
      if (adminBadge) adminBadge.style.display = 'inline-flex';
    }

    function setStatus(html, isError) {
      if (!statusEl) return;
      if (!html) { statusEl.hidden = true; statusEl.innerHTML = ''; return; }
      statusEl.hidden = false;
      statusEl.classList.toggle('is-error', !!isError);
      statusEl.innerHTML = html;
    }
    function setFeedback(msg, kind) {
      if (!feedbackEl) return;
      feedbackEl.textContent = msg || '';
      feedbackEl.classList.toggle('is-error', kind === 'error');
      feedbackEl.classList.toggle('is-ok', kind === 'ok');
    }

    function formatDate(timestamp) {
      var d = new Date(timestamp);
      if (isNaN(d.getTime())) return '';
      var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      var h = d.getHours(), m = d.getMinutes();
      var ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return d.getDate() + ' ' + months[d.getMonth()] + ' AT ' + h + ':' + (m < 10 ? '0' + m : m) + ' ' + ampm;
    }

    // Burgundy / gold avatar palette
    function getAvatarColor(name) {
      var colors = [
        'linear-gradient(135deg, #7C1F35 0%, #5A1226 100%)',
        'linear-gradient(135deg, #9A812D 0%, #6E5C1E 100%)',
        'linear-gradient(135deg, #A24A60 0%, #7C1F35 100%)',
        'linear-gradient(135deg, #6E5C1E 0%, #3A2522 100%)',
        'linear-gradient(135deg, #8A3447 0%, #9A812D 100%)'
      ];
      return colors[(name.charCodeAt(0) || 0) % colors.length];
    }

    function el(tag, className, text) {
      var n = document.createElement(tag);
      if (className) n.className = className;
      if (text != null) n.textContent = text;   // textContent => no HTML injection
      return n;
    }

    function createWishElement(wish) {
      var name = String(wish.name || 'Guest');
      var item = el('div', 'wish-item');
      item.setAttribute('data-aos', 'fade-up');

      var avatar = el('div', 'wish-avatar');
      avatar.style.background = getAvatarColor(name);
      avatar.appendChild(el('span', '', name.charAt(0).toUpperCase()));

      var content = el('div', 'wish-content');
      content.appendChild(el('div', 'wish-author', name));
      content.appendChild(el('div', 'wish-message', String(wish.message || '')));
      content.appendChild(el('div', 'wish-time', formatDate(wish.timestamp)));

      item.appendChild(avatar);
      item.appendChild(content);

      if (isAdmin && wish.id && database) {
        var del = el('button', 'wish-delete-btn');
        del.type = 'button';
        del.setAttribute('aria-label', 'Delete this wish');
        del.innerHTML = '<i class="fas fa-trash-alt"></i>';
        del.addEventListener('click', function() {
          if (!window.confirm('Delete the wish from "' + name + '"? This cannot be undone.')) return;
          database.ref('wishes/' + wish.id).remove(function(error) {
            if (error) window.alert('Could not delete: ' + error.message);
            // The live listener refreshes the list automatically.
          });
        });
        item.appendChild(del);
      }
      return item;
    }

    function displayWishes() {
      wishesList.innerHTML = '';
      if (allWishes.length === 0) {
        wishesDisplay.style.display = 'none';
        return;
      }
      wishesDisplay.style.display = 'block';
      wishesCount.textContent = allWishes.length;

      var count = showingAll ? allWishes.length : Math.min(displayLimit, allWishes.length);
      allWishes.slice(0, count).forEach(function(wish) {
        var node = createWishElement(wish);
        wishesList.appendChild(node);
        if (typeof window.observeAOS === 'function') window.observeAOS(node);
        else node.classList.add('aos-animate');
      });
      viewMoreContainer.style.display = (allWishes.length > displayLimit && !showingAll) ? 'block' : 'none';
    }

    function loadWishes() {
      if (!database) return;
      setStatus('<i class="fas fa-spinner fa-spin"></i>Loading blessings…', false);
      database.ref('wishes').limitToLast(200).on('value', function(snapshot) {
        setStatus('');
        allWishes = [];
        var data = snapshot.val();
        if (data) {
          Object.keys(data).forEach(function(key) {
            var w = data[key];
            if (!w || typeof w !== 'object') return;
            w.id = key;
            allWishes.push(w);
          });
          allWishes.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
        }
        displayWishes();
      }, function(error) {
        console.error('Could not load wishes:', error);
        setStatus('We couldn\u2019t load the wishes right now. <button type="button" id="wishesRetry">Try again</button>', true);
        var retry = document.getElementById('wishesRetry');
        if (retry) retry.addEventListener('click', function() {
          database.ref('wishes').off();
          loadWishes();
        });
      });
    }

    function saveWish(wish, callback) {
      if (!database) { callback(false); return; }
      database.ref('wishes').push().set(wish, function(error) {
        if (error) { console.error('Error saving wish:', error); callback(false); }
        else callback(true);
      });
    }

    var nameInput = document.getElementById('wishesName');
    var messageInput = document.getElementById('wishesMessage');
    var honeypot = document.getElementById('wishesWebsite');

    if (messageInput && charCount) {
      messageInput.addEventListener('input', function() {
        charCount.textContent = messageInput.value.length + ' / 500';
      });
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      setFeedback('');

      var name = nameInput.value.trim();
      var message = messageInput.value.trim();

      if (!name || !message) { setFeedback('Please fill in both your name and message.', 'error'); return; }
      if (name.length > 50) { setFeedback('Please keep your name under 50 characters.', 'error'); return; }
      if (message.length > 500) { setFeedback('Message is too long. Please keep it under 500 characters.', 'error'); return; }

      // Bots fill hidden fields — pretend success, save nothing.
      if (honeypot && honeypot.value) { form.reset(); setFeedback('Thank you! Your wish has been sent.', 'ok'); return; }

      if (!database) {
        setFeedback('Wishes can\u2019t be sent right now. Please try again later.', 'error');
        console.warn('Wishes Wall: Firebase is not configured (js/firebase-config.js).');
        return;
      }

      var last = parseInt(storageGet('wishLastSent') || '0', 10);
      var wait = cooldownMs - (Date.now() - last);
      if (wait > 0) {
        setFeedback('Thank you! Please wait ' + Math.ceil(wait / 1000) + ' seconds before sending another wish.', 'error');
        return;
      }

      var btn = form.querySelector('.wishes-submit-btn');
      var originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING...';
      btn.disabled = true;

      saveWish({ name: name, message: message, timestamp: firebase.database.ServerValue.TIMESTAMP }, function(ok) {
        if (ok) {
          storageSet('wishLastSent', String(Date.now()));
          nameInput.value = '';
          messageInput.value = '';
          if (charCount) charCount.textContent = '0 / 500';
          btn.innerHTML = '<i class="fas fa-check"></i> WISH SENT!';
          setFeedback('JazakAllah Khair — your blessing has been added.', 'ok');
          setTimeout(function() { btn.innerHTML = originalHTML; btn.disabled = false; }, 2000);
          setTimeout(function() { wishesDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 400);
        } else {
          setFeedback('Unable to save your wish. Please check your connection and try again.', 'error');
          btn.innerHTML = originalHTML;
          btn.disabled = false;
        }
      });
    });

    if (viewMoreBtn) {
      viewMoreBtn.addEventListener('click', function() { showingAll = true; displayWishes(); });
    }

    if (database) loadWishes();
    else wishesDisplay.style.display = 'none';
  }

  // ===== RSVP (visible only when a delivery channel exists) =====
  function initRSVP() {
    var section = document.getElementById('rsvp');
    var form = document.getElementById('rsvp-form');
    if (!section || !form) return;

    var rsvpCfg = CFG.rsvp || {};
    var sheetsUrl = safeUrl(rsvpCfg.sheetsUrl);
    var waNumber = cleanDigits(rsvpCfg.whatsapp);
    var database = getDatabase();

    if (!database && !sheetsUrl && !waNumber) return;   // nothing to deliver to → stay hidden
    section.hidden = false;

    var feedback = document.getElementById('rsvpFeedback');
    function say(msg, kind) {
      if (!feedback) return;
      feedback.textContent = msg || '';
      feedback.classList.toggle('is-error', kind === 'error');
      feedback.classList.toggle('is-ok', kind === 'ok');
    }
    function val(n) { var f = form.querySelector('[name="' + n + '"]'); return f ? f.value.trim() : ''; }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      say('');
      var checked = form.querySelector('[name="attend"]:checked');
      var data = {
        name: val('name'), phone: val('phone'), guests: val('guests'),
        message: val('message'), attend: checked ? checked.value : 'attend',
        event: 'Nikah Ceremony — 31 October 2026'
      };
      if (!data.name) { say('Please enter your name.', 'error'); return; }

      var btn = form.querySelector('.rsvp-btn');
      var original = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending…</span>';
      btn.disabled = true;

      function done() {
        btn.innerHTML = '<span>\u2713 Jazakallah Khair!</span>';
        say(data.attend === 'attend' ? 'We look forward to celebrating with you, In Sha Allah.' : 'Thank you for letting us know. You will be in our duas.', 'ok');
        setTimeout(function() { btn.innerHTML = original; btn.disabled = false; form.reset(); }, 3500);
      }
      function fail() {
        btn.innerHTML = original; btn.disabled = false;
        say('We couldn\u2019t send your RSVP. Please check your connection and try again.', 'error');
      }

      if (database) {
        data.timestamp = firebase.database.ServerValue.TIMESTAMP;
        database.ref('rsvps').push().set(data, function(err) { err ? fail() : done(); });
      } else if (sheetsUrl) {
        fetch(sheetsUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(data) })
          .then(done).catch(fail);
      } else {
        var text = 'Assalamu Alaikum, this is ' + data.name + '. ' +
          (data.attend === 'attend' ? 'I will attend' : 'I am unable to attend') +
          ' the Nikah of Rizwan & Faimyz on 31 October 2026 (' + data.guests + ' guest' + (data.guests === '1' ? '' : 's') + ').' +
          (data.message ? ' ' + data.message : '');
        window.open('https://wa.me/' + waNumber + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        done();
      }
    });
  }

  // ===== CONTACT (cards built from js/config.js; hidden when empty) =====
  function initContact() {
    var section = document.getElementById('contact');
    var wrap = document.getElementById('contactCards');
    if (!section || !wrap) return;
    var cfg = CFG.contact || {};
    var delay = 200;

    function action(href, icon, label, outline, external) {
      var a = el('a', 'contact-action' + (outline ? ' is-outline' : ''));
      a.href = href;
      if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      a.innerHTML = '<i class="' + icon + '"></i> ' + label;
      return a;
    }
    function card(iconClass, label, mainText) {
      var c = el('div', 'contact-card');
      c.setAttribute('data-aos', 'fade-up');
      c.setAttribute('data-aos-delay', String(delay)); delay += 100;
      var ic = el('div', 'contact-icon'); ic.innerHTML = '<i class="' + iconClass + '"></i>';
      var info = el('div', 'contact-info');
      info.appendChild(el('p', 'contact-label', label));
      if (mainText) info.appendChild(el('p', 'contact-number', mainText));
      c.appendChild(ic); c.appendChild(info);
      return { card: c, info: info };
    }

    var made = 0;
    (cfg.people || []).forEach(function(p) {
      var phone = cleanPhone(p.phone), wa = cleanDigits(p.whatsapp);
      if (!phone && !wa) return;
      var r = card('fas fa-phone-alt', p.label || 'Contact', phone ? String(p.phone).trim() : '');
      var actions = el('div', 'contact-actions');
      if (phone) actions.appendChild(action('tel:' + phone, 'fas fa-phone-alt', 'Call', false, false));
      if (wa) actions.appendChild(action('https://wa.me/' + wa, 'fab fa-whatsapp', 'WhatsApp', true, true));
      r.info.appendChild(actions);
      wrap.appendChild(r.card);
      made++;
    });
    var email = String(cfg.email || '').trim();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      var r2 = card('fas fa-envelope', 'Email', email);
      var acts = el('div', 'contact-actions');
      acts.appendChild(action('mailto:' + email, 'fas fa-envelope', 'Send Email', false, false));
      r2.info.appendChild(acts);
      wrap.appendChild(r2.card);
      made++;
    }

    if (!made) return;           // no contact details → section stays hidden
    section.hidden = false;
    Array.prototype.forEach.call(wrap.querySelectorAll('[data-aos]'), function(n) {
      if (typeof window.observeAOS === 'function') window.observeAOS(n); else n.classList.add('aos-animate');
    });
  }

  // ===== FOOTER LINKS (Instagram / WhatsApp only when configured) =====
  function initFooterSocial() {
    var wrap = document.getElementById('footerSocial');
    if (!wrap) return;
    var s = CFG.social || {};
    function add(href, iconClass, label, first) {
      var a = document.createElement('a');
      a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.className = 'social-icon'; a.setAttribute('aria-label', label);
      a.innerHTML = '<i class="' + iconClass + '"></i>';
      if (first) wrap.insertBefore(a, wrap.firstChild); else wrap.appendChild(a);
    }
    var ig = safeUrl(s.instagram);
    var wa = cleanDigits(s.whatsapp);
    if (wa) add('https://wa.me/' + wa, 'fab fa-whatsapp', 'WhatsApp', true);
    if (ig) add(ig, 'fab fa-instagram', 'Instagram', true);
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', function() {
    initMusic();
    initGate();
    initMobileNav();
    initSectionTracking();
    initLightbox();
    initWishesWall();
    initRSVP();
    initContact();
    initFooterSocial();
  });
})();