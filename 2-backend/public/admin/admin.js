/* ═══════════════════════════════════════════════════════════
   Admin Dashboard JS — Loaiy Adel CV
   No native alert() / confirm() — all in-page UI
   ═══════════════════════════════════════════════════════════ */

const API = '/api';
let TOKEN = localStorage.getItem('cv_admin_token') || '';

/* ── Helpers ────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

async function apiFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    ...opts,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function statCard(label, value, mod = '') {
  return `<div class="stat-card ${mod}">
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
  </div>`;
}

function showStatus(el, msg, ok = true) {
  el.textContent = (ok ? '✓ ' : '✗ ') + msg;
  el.className = 'save-status ' + (ok ? 'ok' : 'err');
  setTimeout(() => { el.textContent = ''; el.className = 'save-status'; }, 3000);
}

/* ── Toast notifications ────────────────────────────────── */
function toast(msg, type = 'ok') {
  const icons = { ok: '✓', err: '✗', info: 'ℹ' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${esc(msg)}</span>`;
  $('#toastContainer').appendChild(el);
  setTimeout(() => {
    el.classList.add('hiding');
    el.addEventListener('animationend', () => el.remove());
  }, 3500);
}

/* ── Custom confirm modal ───────────────────────────────── */
function confirmDialog(message, label = 'Delete') {
  return new Promise((resolve) => {
    $('#confirmMsg').textContent = message;
    $('#confirmYes').textContent = label;
    $('#confirmOverlay').hidden  = false;

    function onYes() { close(true);  }
    function onNo()  { close(false); }

    function close(result) {
      $('#confirmOverlay').hidden = true;
      $('#confirmYes').removeEventListener('click', onYes);
      $('#confirmNo').removeEventListener('click',  onNo);
      resolve(result);
    }

    $('#confirmYes').addEventListener('click', onYes);
    $('#confirmNo').addEventListener('click',  onNo);
  });
}

/* ── Auth ───────────────────────────────────────────────── */
function init() {
  TOKEN ? showDashboard() : showLogin();
}

function showLogin() {
  $('#loginScreen').hidden = false;
  $('#dashboard').hidden   = true;
}

function showDashboard() {
  $('#loginScreen').hidden = true;
  $('#dashboard').hidden   = false;
  loadTab('messages');
}

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn   = $('#loginBtn');
  const label = btn.querySelector('.btn-label');
  const spin  = btn.querySelector('.spinner');
  const errEl = $('#loginError');
  errEl.textContent = '';

  btn.disabled = true; label.hidden = true; spin.hidden = false;
  try {
    const { token } = await apiFetch('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: $('#password').value }),
    });
    TOKEN = token;
    localStorage.setItem('cv_admin_token', token);
    showDashboard();
  } catch (err) {
    errEl.textContent = '✗ ' + err.message;
  } finally {
    btn.disabled = false; label.hidden = false; spin.hidden = true;
  }
});

$('#logoutBtn').addEventListener('click', () => {
  TOKEN = '';
  localStorage.removeItem('cv_admin_token');
  showLogin();
  toast('Logged out', 'info');
});

/* ── Tab switching ──────────────────────────────────────── */
const TAB_META = {
  messages:  { title: 'Messages',  sub: 'Contact form submissions' },
  analytics: { title: 'Analytics', sub: 'Visitor statistics' },
  cv:        { title: 'CV Editor', sub: 'Edit your resume content' },
};

$$('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    $$('.tab').forEach(t => t.hidden = true);
    $('#tab-' + tab).hidden = false;
    $('#topbarTitle').textContent = TAB_META[tab].title;
    $('#topbarSub').textContent   = TAB_META[tab].sub;
    loadTab(tab);
  });
});

function loadTab(tab) {
  if (tab === 'messages')  loadMessages();
  if (tab === 'analytics') loadAnalytics();
  if (tab === 'cv')        loadCV('profile');
}

/* ── Refresh button ─────────────────────────────────────── */
$('#refreshBtn').addEventListener('click', () => {
  const btn = $('#refreshBtn');
  btn.classList.add('spinning');
  const activeTab = $('.nav-item.active')?.dataset.tab || 'messages';
  loadTab(activeTab);
  setTimeout(() => btn.classList.remove('spinning'), 800);
});

/* ══════════════════════════════════════════════════════════
   MESSAGES
   ══════════════════════════════════════════════════════════ */
async function loadMessages() {
  const tbody = $('#messagesBody');
  tbody.innerHTML = '<tr><td colspan="6" class="empty">Loading…</td></tr>';

  try {
    const { data: msgs } = await apiFetch('/admin/messages');

    const total  = msgs.length;
    const unread = msgs.filter(m => !m.read).length;
    const today  = msgs.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length;

    $('#msgStats').innerHTML =
      statCard('Total Messages', total, 'accent') +
      statCard('Unread', unread, unread > 0 ? 'amber' : '') +
      statCard('Today', today, 'green');

    const badge = $('#unreadBadge');
    if (unread > 0) { badge.textContent = unread; badge.hidden = false; }
    else badge.hidden = true;

    if (!msgs.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty">No messages yet — submit the contact form on your CV to test</td></tr>';
      return;
    }

    tbody.innerHTML = msgs.map(m => `
      <tr class="${m.read ? '' : 'unread'}" data-id="${m._id}">
        <td><strong>${esc(m.name)}</strong></td>
        <td><a href="mailto:${esc(m.email)}" style="color:var(--sky)">${esc(m.email)}</a></td>
        <td>${esc(m.subject || '—')}</td>
        <td style="white-space:nowrap;color:var(--text-muted)">${fmt(m.createdAt)}</td>
        <td><span class="pill ${m.read ? 'pill-read' : 'pill-new'}">${m.read ? 'Read' : 'New'}</span></td>
        <td>
          <div class="actions">
            <button class="btn-icon" title="View" onclick="viewMessage('${m._id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            ${!m.read ? `<button class="btn-icon success" title="Mark as read" onclick="markRead('${m._id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </button>` : ''}
            <button class="btn-icon danger" title="Delete" onclick="deleteMessage('${m._id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">Error loading messages</td></tr>`;
    if (err.message.toLowerCase().includes('token') || err.message.includes('401')) {
      TOKEN = ''; localStorage.removeItem('cv_admin_token'); showLogin();
    }
  }
}

async function viewMessage(id) {
  try {
    const { data: msgs } = await apiFetch('/admin/messages');
    const m = msgs.find(x => x._id === id);
    if (!m) return;

    $('#modalTitle').textContent = `From ${m.name}`;
    $('#modalBody').innerHTML = `
      <div class="msg-field"><strong>From</strong><span>${esc(m.name)} — <a href="mailto:${esc(m.email)}" style="color:var(--sky)">${esc(m.email)}</a></span></div>
      <div class="msg-field"><strong>Subject</strong><span>${esc(m.subject || '(no subject)')}</span></div>
      <div class="msg-field"><strong>Received</strong><span>${fmt(m.createdAt)}</span></div>
      <div class="msg-field"><strong>Message</strong><p>${esc(m.body)}</p></div>
    `;
    $('#modalOverlay').hidden = false;
    if (!m.read) markRead(id, true);
  } catch (err) { toast('Could not load message', 'err'); }
}

async function markRead(id, silent = false) {
  try {
    await apiFetch(`/admin/messages/${id}/read`, { method: 'PATCH' });
    loadMessages();
    if (!silent) toast('Marked as read', 'ok');
  } catch (err) { toast(err.message, 'err'); }
}

async function deleteMessage(id) {
  const ok = await confirmDialog('This message will be permanently deleted.', 'Delete');
  if (!ok) return;
  try {
    await apiFetch(`/admin/messages/${id}`, { method: 'DELETE' });
    loadMessages();
    toast('Message deleted', 'ok');
  } catch (err) { toast(err.message, 'err'); }
}

window.viewMessage   = viewMessage;
window.markRead      = markRead;
window.deleteMessage = deleteMessage;

/* ── Modals ─────────────────────────────────────────────── */
$('#modalClose').addEventListener('click', () => $('#modalOverlay').hidden = true);
$('#modalOverlay').addEventListener('click', e => {
  if (e.target === $('#modalOverlay')) $('#modalOverlay').hidden = true;
});

/* ══════════════════════════════════════════════════════════
   ANALYTICS
   ══════════════════════════════════════════════════════════ */
let visitsChartInstance = null;

async function loadAnalytics() {
  $('#analyticsStats').innerHTML =
    statCard('Loading…','—') + statCard('—','—') + statCard('—','—') + statCard('—','—');
  try {
    const { data } = await apiFetch('/admin/analytics');
    const { totalViews, uniqueVisitors, todayViews, todayUnique, visitsByDay, topReferrers } = data;

    $('#analyticsStats').innerHTML =
      statCard('Total Page Views',   totalViews,     'accent') +
      statCard('Unique Visitors',    uniqueVisitors, 'green')  +
      statCard('Views Today',        todayViews,     'amber')  +
      statCard('Unique Today',       todayUnique,    '');

    renderChart(visitsByDay);
    renderReferrers(topReferrers);
  } catch (err) {
    $('#analyticsStats').innerHTML = `<div class="empty">Could not load analytics</div>`;
  }
}

function renderChart(data) {
  const canvas   = $('#visitsChart');
  const emptyEl  = $('#chartEmpty');

  if (!data || !data.length) {
    canvas.hidden   = true;
    emptyEl.hidden  = false;
    return;
  }
  canvas.hidden  = false;
  emptyEl.hidden = true;

  const labels  = data.map(d => {
    const [, m, day] = d._id.split('-');
    return `${day}/${m}`;
  });
  const views   = data.map(d => d.views);
  const unique  = data.map(d => d.unique);

  // Destroy previous instance to avoid canvas reuse error
  if (visitsChartInstance) {
    visitsChartInstance.destroy();
    visitsChartInstance = null;
  }

  const ctx = canvas.getContext('2d');

  // Gradient fill for page views
  const gradViews = ctx.createLinearGradient(0, 0, 0, 280);
  gradViews.addColorStop(0,   'rgba(2, 114, 192, 0.35)');
  gradViews.addColorStop(0.7, 'rgba(2, 114, 192, 0.05)');
  gradViews.addColorStop(1,   'rgba(2, 114, 192, 0)');

  // Gradient fill for unique visitors
  const gradUnique = ctx.createLinearGradient(0, 0, 0, 280);
  gradUnique.addColorStop(0,   'rgba(34, 197, 94, 0.25)');
  gradUnique.addColorStop(0.7, 'rgba(34, 197, 94, 0.04)');
  gradUnique.addColorStop(1,   'rgba(34, 197, 94, 0)');

  visitsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label:           'Page Views',
          data:            views,
          borderColor:     '#0272c0',
          backgroundColor: gradViews,
          borderWidth:     2.5,
          pointRadius:     3,
          pointHoverRadius:6,
          pointBackgroundColor: '#0272c0',
          pointBorderColor:     '#0d1829',
          pointBorderWidth:     2,
          tension:         0.4,
          fill:            true,
          order:           2,
        },
        {
          label:           'Unique Visitors',
          data:            unique,
          borderColor:     '#22c55e',
          backgroundColor: gradUnique,
          borderWidth:     2,
          pointRadius:     3,
          pointHoverRadius:6,
          pointBackgroundColor: '#22c55e',
          pointBorderColor:     '#0d1829',
          pointBorderWidth:     2,
          tension:         0.4,
          fill:            true,
          order:           1,
        },
      ],
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      animation:   { duration: 600, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0d1829',
          borderColor:     'rgba(255,255,255,0.12)',
          borderWidth:     1,
          titleColor:      '#e8eef5',
          bodyColor:       '#b0c4d8',
          padding:         10,
          cornerRadius:    8,
          callbacks: {
            title: items => {
              const d = data[items[0].dataIndex];
              return d ? d._id : items[0].label;
            },
            label: item => ` ${item.dataset.label}: ${item.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: { color: '#6b85a0', font: { size: 11 }, maxRotation: 0,
                   maxTicksLimit: 10 },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: { color: '#6b85a0', font: { size: 11 }, precision: 0,
                   stepSize: 1 },
          border: { display: false },
        },
      },
    },
  });
}

function renderReferrers(data) {
  const el = $('#referrerList');
  if (!data.length) { el.innerHTML = '<div class="empty">No referrer data yet</div>'; return; }
  el.innerHTML = data.map(r => `
    <div class="referrer-item">
      <span class="referrer-url" title="${esc(r._id)}">${esc(r._id || 'Direct')}</span>
      <span class="referrer-count">${r.count}</span>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════════
   CV EDITOR
   ══════════════════════════════════════════════════════════ */
$$('.cv-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.cv-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    $$('.cv-section').forEach(s => s.hidden = true);
    $('#cv-' + btn.dataset.section).hidden = false;
    loadCV(btn.dataset.section);
  });
});

let _profileId = null;

async function loadCV(section) {
  if (section === 'profile')        await loadProfile();
  if (section === 'experience')     await loadList('experience');
  if (section === 'skills')         await loadList('skills');
  if (section === 'certifications') await loadList('certifications');
}

async function loadProfile() {
  try {
    const { data } = await apiFetch('/cv/profile');
    if (!data) return;
    _profileId = data._id;
    const form = $('#profileForm');
    ['name','title','subtitle','email','phone','location','linkedin','statusChip','bio','contactNote'].forEach(k => {
      if (form.elements[k]) form.elements[k].value = data[k] || '';
    });
    // Populate stats fields
    if (data.stats && data.stats.length) {
      data.stats.forEach((s, i) => {
        const valEl = form.elements[`stat_val_${i}`];
        const lblEl = form.elements[`stat_lbl_${i}`];
        if (valEl) valEl.value = s.value || '';
        if (lblEl) lblEl.value = s.label || '';
      });
    }
  } catch (err) { toast('Could not load profile', 'err'); }
}

$('#profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = $('#profileSaveStatus');
  const form   = e.target;
  const body   = {};
  ['name','title','subtitle','email','phone','location','linkedin','statusChip','bio','contactNote'].forEach(k => {
    body[k] = form.elements[k]?.value || '';
  });
  // Build stats array from the 4 stat pairs
  body.stats = [];
  for (let i = 0; i < 4; i++) {
    const val = form.elements[`stat_val_${i}`]?.value?.trim();
    const lbl = form.elements[`stat_lbl_${i}`]?.value?.trim();
    if (val || lbl) body.stats.push({ value: val || '', label: lbl || '' });
  }
  try {
    await apiFetch(`/admin/cv/profile/${_profileId}`, { method: 'PUT', body: JSON.stringify(body) });
    showStatus(status, 'Saved!');
    toast('Profile saved ✓', 'ok');
  } catch (err) { showStatus(status, err.message, false); toast(err.message, 'err'); }
});

/* Generic list sections */
const SECTION_META = {
  experience: {
    title: e => e.role + ' @ ' + e.company,
    sub:   e => `${e.startDate} — ${e.endDate}${e.isCurrent ? ' · Current' : ''}`,
    modal: renderExpModal,
  },
  skills: {
    title: s => s.category,
    sub:   s => (s.items || []).join(', '),
    modal: renderSkillModal,
  },
  certifications: {
    title: c => c.name,
    sub:   c => `${c.issuer}${c.issueDate ? ' · ' + c.issueDate : ''}`,
    modal: renderCertModal,
  },
};

function listElId(section) {
  const map = { experience: 'expList', skills: 'skillList', certifications: 'certList' };
  return map[section];
}

async function loadList(section) {
  const listEl = $('#' + listElId(section));
  if (!listEl) return;
  listEl.innerHTML = '<div class="empty">Loading…</div>';
  try {
    const { data } = await apiFetch(`/cv/${section}`);
    if (!data.length) { listEl.innerHTML = '<div class="empty">None added yet</div>'; return; }
    const meta = SECTION_META[section];
    const hasLogo = section === 'experience' || section === 'certifications';
    listEl.innerHTML = data.map(item => {
      const logoHtml = hasLogo && item.logo
        ? `<img class="item-icon" src="${esc(item.logo)}" alt="" onerror="this.style.opacity='0'">`
        : (hasLogo ? `<div class="item-icon-ph"></div>` : '');
      return `
      <div class="item-row">
        ${logoHtml}
        <div class="item-info">
          <div class="item-title">${esc(meta.title(item))}</div>
          <div class="item-sub">${esc(meta.sub(item))}</div>
        </div>
        <div class="item-actions">
          <button class="btn-icon" title="Edit" onclick="editItem('${section}','${item._id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" title="Delete" onclick="deleteItem('${section}','${item._id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');
  } catch (err) { listEl.innerHTML = `<div class="empty">Error loading ${section}</div>`; }
}

async function editItem(section, id) {
  try {
    const { data } = await apiFetch(`/cv/${section}`);
    const item = data.find(x => x._id === id);
    if (!item) return;
    const meta = SECTION_META[section];
    $('#modalTitle').textContent = 'Edit';
    $('#modalBody').innerHTML = meta.modal(item, id, section);
    $('#modalOverlay').hidden = false;
  } catch (err) { toast('Could not load item', 'err'); }
}

async function deleteItem(section, id) {
  const ok = await confirmDialog(`Delete this ${section.slice(0,-1)}? This cannot be undone.`, 'Delete');
  if (!ok) return;
  try {
    await apiFetch(`/admin/cv/${section}/${id}`, { method: 'DELETE' });
    loadList(section);
    toast('Deleted', 'ok');
  } catch (err) { toast(err.message, 'err'); }
}

window.editItem   = editItem;
window.deleteItem = deleteItem;

/* ── Item modals ────────────────────────────────────────── */
function renderExpModal(item, id, section) {
  const saveCall = id ? `saveItem(event,'${section}','${id}')` : `addItem(event,'${section}')`;
  return `<form onsubmit="${saveCall}">
    <div style="display:flex;flex-direction:column;gap:.75rem">
      ${field('Role / Job Title', 'role', item.role)}
      ${field('Company', 'company', item.company)}
      ${field('Location', 'location', item.location)}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        ${field('Start Date', 'startDate', item.startDate)}
        ${field('End Date', 'endDate', item.endDate)}
      </div>
      <label style="display:flex;align-items:center;gap:.5rem;color:var(--text-mid);font-size:.85rem;cursor:pointer">
        <input type="checkbox" name="isCurrent" ${item.isCurrent ? 'checked' : ''} style="width:auto;cursor:pointer"> Current role
      </label>
      ${fieldIcon('Company Logo URL', 'logo', item.logo || '')}
      ${fieldArea('Achievements (one per line)', 'bullets', (item.bullets||[]).join('\n'))}
      <button type="submit" class="btn-save" style="align-self:flex-start">Save</button>
    </div>
  </form>`;
}

function renderSkillModal(item, id, section) {
  const saveCall = id ? `saveItem(event,'${section}','${id}')` : `addItem(event,'${section}')`;
  return `<form onsubmit="${saveCall}">
    <div style="display:flex;flex-direction:column;gap:.75rem">
      ${field('Category Name', 'category', item.category)}
      ${fieldArea('Skills (comma-separated)', 'items', (item.items||[]).join(', '))}
      <button type="submit" class="btn-save" style="align-self:flex-start">Save</button>
    </div>
  </form>`;
}

function renderCertModal(item, id, section) {
  const saveCall = id ? `saveItem(event,'${section}','${id}')` : `addItem(event,'${section}')`;
  return `<form onsubmit="${saveCall}">
    <div style="display:flex;flex-direction:column;gap:.75rem">
      ${field('Certification Name', 'name', item.name)}
      ${field('Issuer / Organisation', 'issuer', item.issuer)}
      ${field('Issue Date (e.g. Nov 2025)', 'issueDate', item.issueDate || '')}
      ${field('Credential URL (optional)', 'credentialUrl', item.credentialUrl || '')}
      ${fieldIcon('Issuer Logo URL', 'logo', item.logo || '')}
      <button type="submit" class="btn-save" style="align-self:flex-start">Save</button>
    </div>
  </form>`;
}

function field(label, name, value = '') {
  return `<div class="field"><label>${label}</label><input type="text" name="${name}" value="${esc(value)}"></div>`;
}
function fieldArea(label, name, value = '') {
  return `<div class="field"><label>${label}</label><textarea name="${name}" rows="4">${esc(value)}</textarea></div>`;
}
function fieldIcon(label, name, value = '') {
  const pid = 'iprev-' + name + '-' + Math.random().toString(36).slice(2, 7);
  return `<div class="field">
    <label>${label}</label>
    <div class="icon-field-row">
      <input type="text" name="${name}" value="${esc(value)}"
        placeholder="https://logo.clearbit.com/company.com"
        oninput="(function(el){var img=document.getElementById('${pid}');if(img){img.src=el.value||'';img.style.opacity=el.value?'1':'0';}})(this)">
      <div class="icon-field-preview">
        <img id="${pid}" src="${esc(value)}" alt="preview"
          style="opacity:${value ? '1' : '0'}"
          onerror="this.style.opacity='0'" onload="this.style.opacity='1'">
      </div>
    </div>
  </div>`;
}

window.saveItem = async function(e, section, id) {
  e.preventDefault();
  const body = formToBody(e.target, section);
  try {
    await apiFetch(`/admin/cv/${section}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    $('#modalOverlay').hidden = true;
    loadList(section);
    toast('Saved ✓', 'ok');
  } catch (err) { toast(err.message, 'err'); }
};

/* ── Add new items ──────────────────────────────────────── */
$('#addExpBtn')?.addEventListener('click',  () => openAddModal('experience',     renderExpModal({},   null, 'experience')));
$('#addSkillBtn')?.addEventListener('click', () => openAddModal('skills',        renderSkillModal({}, null, 'skills')));
$('#addCertBtn')?.addEventListener('click',  () => openAddModal('certifications',renderCertModal({},  null, 'certifications')));

function openAddModal(section, html) {
  $('#modalTitle').textContent = 'Add ' + section.slice(0,-1);
  $('#modalBody').innerHTML = html;
  $('#modalOverlay').hidden = false;
}

window.addItem = async function(e, section) {
  e.preventDefault();
  const body = formToBody(e.target, section);
  try {
    await apiFetch(`/admin/cv/${section}`, { method: 'POST', body: JSON.stringify(body) });
    $('#modalOverlay').hidden = true;
    loadList(section);
    toast('Added ✓', 'ok');
  } catch (err) { toast(err.message, 'err'); }
};

function formToBody(form, section) {
  const fd   = new FormData(form);
  const body = {};
  for (const [k, v] of fd.entries()) body[k] = v;
  if (body.bullets)    body.bullets = body.bullets.split('\n').map(s => s.trim()).filter(Boolean);
  if (body.items)      body.items   = body.items.split(',').map(s => s.trim()).filter(Boolean);
  if ('isCurrent' in body) body.isCurrent = true;
  else if (section === 'experience') body.isCurrent = false;
  return body;
}

/* ── XSS-safe escape ────────────────────────────────────── */
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Boot ───────────────────────────────────────────────── */
init();
