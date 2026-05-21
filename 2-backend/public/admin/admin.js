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
async function loadAnalytics() {
  $('#analyticsStats').innerHTML = statCard('Loading…', '—');
  try {
    const { data } = await apiFetch('/admin/analytics');
    const { totalVisits, visitsByDay, topReferrers } = data;
    const last30 = visitsByDay.reduce((s, d) => s + d.count, 0);
    const today  = visitsByDay.find(d => d._id === new Date().toISOString().slice(0,10))?.count || 0;

    $('#analyticsStats').innerHTML =
      statCard('Total Visits', totalVisits, 'accent') +
      statCard('Last 30 Days', last30, 'green') +
      statCard('Today', today, 'amber');

    renderChart(visitsByDay);
    renderReferrers(topReferrers);
  } catch (err) {
    $('#analyticsStats').innerHTML = `<div class="empty">Could not load analytics</div>`;
  }
}

function renderChart(data) {
  const wrap = $('#chartWrap');
  if (!data.length) {
    wrap.innerHTML = '<div class="empty" style="align-self:center;width:100%">No visits yet.<br>Open your CV page to record the first visit.</div>';
    return;
  }
  const max = Math.max(...data.map(d => d.count), 1);
  wrap.innerHTML = data.map(d => {
    const pct   = Math.round((d.count / max) * 100);
    const label = d._id.slice(5);
    return `<div class="chart-bar-wrap" title="${d._id}: ${d.count} visit${d.count !== 1 ? 's' : ''}">
      <div class="chart-bar" style="height:${Math.max(pct, 2)}%"></div>
      <div class="chart-label">${label}</div>
    </div>`;
  }).join('');
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
    ['name','title','subtitle','email','phone','location','linkedin','statusChip','bio'].forEach(k => {
      if (form.elements[k]) form.elements[k].value = data[k] || '';
    });
  } catch (err) { toast('Could not load profile', 'err'); }
}

$('#profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = $('#profileSaveStatus');
  const form   = e.target;
  const body   = {};
  ['name','title','subtitle','email','phone','location','linkedin','statusChip','bio'].forEach(k => {
    body[k] = form.elements[k].value;
  });
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
    listEl.innerHTML = data.map(item => `
      <div class="item-row">
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
      </div>
    `).join('');
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
