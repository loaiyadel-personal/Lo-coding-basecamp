/* ═══════════════════════════════════════════════════════════════
   cv-loader.js  —  Live CV hydration from the backend API
   Fetches /api/cv/all on page load and updates the DOM.
   Falls back silently to the static HTML if the backend is offline.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Auto-detect: use Render in production (GitHub Pages), localhost in dev
  const API_BASE = window.location.hostname === 'loaiyadel-personal.github.io'
    ? 'https://loaiy-cv-api.onrender.com/api'
    : 'http://localhost:3001/api';

  /* ── XSS-safe escape ──────────────────────────────────────────── */
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Apply Profile ────────────────────────────────────────────── */
  function applyProfile(p) {
    if (!p) return;

    // Profile photo
    if (p.photo) {
      const picEl = document.querySelector('.profile-pic');
      if (picEl) picEl.src = p.photo;
    }

    // Hero name
    const nameEl = document.querySelector('.hero-name');
    if (nameEl && p.name) nameEl.textContent = p.name;

    // Hero role line (title · subtitle)
    const roleEl = document.querySelector('.hero-role');
    if (roleEl && (p.title || p.subtitle)) {
      roleEl.textContent = [p.title, p.subtitle].filter(Boolean).join(' · ');
    }

    // Availability chip
    const chipEl = document.querySelector('.chip-avail');
    if (chipEl && p.statusChip) chipEl.textContent = p.statusChip;

    // Bio paragraph
    const bioEl = document.querySelector('.hero-bio');
    if (bioEl && p.bio) {
      // Preserve bold tags if bio contains them, otherwise escape
      bioEl.innerHTML = p.bio
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // markdown bold → <strong>
    }

    // Stats row (up to 4 stat columns)
    if (p.stats && p.stats.length) {
      const statCols = document.querySelectorAll('.stat-col');
      p.stats.forEach((s, i) => {
        const col = statCols[i];
        if (!col) return;
        // Parse value: "11+" → num="11", suffix="+"
        const match  = String(s.value).match(/^([\d.]+)(.*)$/);
        const num    = match ? match[1] : s.value;
        const suffix = match ? match[2] : '';
        const statN  = col.querySelector('.stat-n');
        if (statN) {
          statN.innerHTML = `<span class="stat-num">${esc(num)}</span>${suffix ? `<sup>${esc(suffix)}</sup>` : ''}`;
        }
        const statL = col.querySelector('.stat-l');
        if (statL && s.label) statL.textContent = s.label;
      });
    }

    // Navbar — phone
    if (p.phone) {
      const phoneLink = document.getElementById('nav-phone');
      const phoneText = document.getElementById('nav-phone-text');
      if (phoneLink) phoneLink.href = 'tel:' + p.phone.replace(/\s+/g, '');
      if (phoneText) phoneText.textContent = p.phone;
    }

    // Navbar — email
    if (p.email) {
      const emailLink = document.getElementById('nav-email');
      const emailText = document.getElementById('nav-email-text');
      if (emailLink) emailLink.href = 'mailto:' + p.email;
      if (emailText) emailText.textContent = p.email;
    }

    // Navbar — location
    if (p.location) {
      const locText = document.getElementById('nav-location-text');
      if (locText) locText.textContent = p.location;
    }

    // LinkedIn chip href
    if (p.linkedin) {
      const liChip = document.querySelector('.chip-li');
      if (liChip) liChip.href = p.linkedin;
    }

    // ── Contact section ────────────────────────────────────────
    // Subtitle / note
    const contactSub = document.getElementById('contact-sub-text');
    if (contactSub && p.contactNote) contactSub.textContent = p.contactNote;

    // Email link + text
    if (p.email) {
      const emailLink = document.getElementById('contact-email-link');
      const emailText = document.getElementById('contact-email-text');
      if (emailLink) emailLink.href = 'mailto:' + p.email;
      if (emailText) emailText.textContent = p.email;
    }

    // Phone link + text
    if (p.phone) {
      const phoneLink = document.getElementById('contact-phone-link');
      const phoneText = document.getElementById('contact-phone-text');
      if (phoneLink) phoneLink.href = 'tel:' + p.phone.replace(/\s+/g, '');
      if (phoneText) phoneText.textContent = p.phone;
    }

    // LinkedIn link
    if (p.linkedin) {
      const liLink = document.getElementById('contact-li-link');
      if (liLink) liLink.href = p.linkedin;
    }

    // Location
    if (p.location) {
      const locText = document.getElementById('contact-location-text');
      if (locText) locText.textContent = p.location;
    }

    // ── Footer ─────────────────────────────────────────────────
    if (p.title) {
      const ftitle = document.getElementById('footer-title');
      if (ftitle) ftitle.textContent = [p.title, p.subtitle].filter(Boolean).join(' · ');
    }
    if (p.email) {
      const femail = document.getElementById('footer-email-link');
      const femailText = document.getElementById('footer-email-text');
      if (femail) femail.href = 'mailto:' + p.email;
      if (femailText) femailText.textContent = p.email;
    }
  }

  /* ── Apply Experience ─────────────────────────────────────────── */
  function applyExperience(items) {
    if (!items || !items.length) return;
    const cards = document.querySelectorAll('#cv-timeline .exp-card');

    items.forEach((item, i) => {
      const card = cards[i];
      if (!card) return;

      // Role title (h3)
      const h3 = card.querySelector('h3');
      if (h3) h3.textContent = item.role;

      // Company name (in .co-name, inside an <a> or plain text)
      const coName = card.querySelector('.co-name');
      if (coName) {
        const link = coName.querySelector('a');
        if (link) link.textContent = item.company;
      }

      // Date badge
      const dateBadge = card.querySelector('.badge-date');
      if (dateBadge) {
        dateBadge.textContent = `${item.startDate} — ${item.endDate || 'Present'}`;
      }

      // Current role badge (show/hide)
      const nowBadge = card.querySelector('.badge-now');
      if (nowBadge) nowBadge.hidden = !item.isCurrent;

      // Company logo — swap in URL from DB (replaces embedded base64)
      if (item.logo) {
        const logoImg = card.querySelector('.logo-box .logo-img, .logo-box img');
        if (logoImg) logoImg.src = item.logo;
      }

      // Bullets
      const ul = card.querySelector('.bullets');
      if (ul && item.bullets && item.bullets.length) {
        ul.innerHTML = item.bullets.map(b => `<li>${esc(b)}</li>`).join('');
        ul.setAttribute('aria-label', `Key achievements at ${esc(item.company)}`);
      }
    });
  }

  /* ── Apply Skills ─────────────────────────────────────────────── */
  function applySkills(skills) {
    if (!skills || !skills.length) return;
    const card = document.getElementById('cv-skills-card');
    if (!card) return;

    // Keep the heading, replace the skill groups
    const heading = card.querySelector('.side-title');
    const headingHTML = heading ? heading.outerHTML : '<h2 class="side-title">Core Competencies</h2>';

    // Tag class: first skill category gets "pri", rest get "neu"
    const tagClasses = ['pri', 'neu', 'sec', 'acc'];

    card.innerHTML = headingHTML + skills.map((s, i) => {
      const cls = tagClasses[i] || 'neu';
      const tags = (s.items || []).map(item => `<span class="tag ${cls}">${esc(item)}</span>`).join('');
      const mt   = i > 0 ? ' style="margin-top:.95rem"' : '';
      return `
      <div class="skill-group"${mt}>
        <div class="skill-group-label">${esc(s.category)}</div>
        <div class="tag-cloud">${tags}</div>
      </div>`;
    }).join('');
  }

  /* ── Apply Certifications ─────────────────────────────────────── */
  function applyCertifications(certs) {
    if (!certs || !certs.length) return;
    const credItems = document.querySelectorAll('#cv-creds-card .cred-item');

    certs.forEach((cert, i) => {
      const item = credItems[i];
      if (!item) return;

      // Cert name span (keep any inline .cred-chip badge)
      const nameEl = item.querySelector('.cred-name');
      if (nameEl && cert.name) {
        const chip = nameEl.querySelector('.cred-chip');
        nameEl.textContent = cert.name;
        if (chip) {
          nameEl.textContent += ' ';
          nameEl.appendChild(chip);
        }
      }

      // Issuer + date
      const issuerEl = item.querySelector('.cred-issuer');
      if (issuerEl) {
        const parts = [cert.issuer, cert.issueDate].filter(Boolean);
        issuerEl.textContent = parts.join(' · ');
      }

      // Link href
      if (cert.credentialUrl) item.href = cert.credentialUrl;

      // Issuer logo — swap in URL from DB if provided
      if (cert.logo) {
        const logoImg = item.querySelector('.cred-logo-wrap img');
        if (logoImg) logoImg.src = cert.logo;
      }
    });
  }

  /* ── Apply Services ──────────────────────────────────────────── */
  function applyServices(services) {
    if (!services || !services.length) return;
    const grid = document.querySelector('.services-grid');
    if (!grid) return;

    const active = services.filter(s => s.active !== false);
    if (!active.length) return;

    grid.innerHTML = active.map(svc => `
      <article class="svc-card" aria-label="${esc(svc.title)}">
        <div class="svc-icon" aria-hidden="true">
          <span class="svc-icon-emoji">${esc(svc.icon || '⚡')}</span>
        </div>
        <h3 class="svc-title">${esc(svc.title)}</h3>
        <p class="svc-desc">${esc(svc.description)}</p>
        <ul class="svc-list">
          ${(svc.deliverables || []).map(d => `<li>${esc(d)}</li>`).join('')}
        </ul>
        <button class="svc-btn" data-service="${esc(svc.title)}" aria-label="Enquire about ${esc(svc.title)}">
          Let's talk
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </article>`).join('');
    // svc-btn clicks handled via event delegation on document (in page inline script)
  }

  /* ── Main loader ──────────────────────────────────────────────── */
  async function loadCV() {
    try {
      const res = await fetch(`${API_BASE}/cv/all`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return; // Backend returned error — keep static HTML

      const { data } = await res.json();
      if (!data) return;

      applyProfile(data.profile);
      applyExperience(data.experience);
      applySkills(data.skills);
      applyCertifications(data.certifications);
      applyServices(data.services);
    } catch (e) {
      // Backend offline or request failed — static HTML remains, no error shown to visitor
    }
  }

  // Run after DOM is parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCV);
  } else {
    loadCV();
  }
})();
