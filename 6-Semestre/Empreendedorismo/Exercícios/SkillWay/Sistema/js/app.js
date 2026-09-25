/* ============ SkillWay — App Logic ============ */

const SkillWay = {
  USER_KEY: 'skillway_user',
  DIAG_KEY: 'skillway_diagnostico',

  // ---------- Auth ----------
  getUser() {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY)); } catch (e) { return null; }
  },
  setUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem(this.USER_KEY);
    window.location.href = 'login.html';
  },
  requireAuth() {
    const user = this.getUser();
    if (!user) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  },

  // ---------- Diagnóstico state ----------
  getDiagnostico() {
    try { return JSON.parse(localStorage.getItem(this.DIAG_KEY)); } catch (e) { return null; }
  },
  setDiagnostico(data) {
    localStorage.setItem(this.DIAG_KEY, JSON.stringify(data));
  },

  // ---------- Helpers ----------
  initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  toast(message, type) {
    let el = document.getElementById('sw-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sw-toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { el.classList.remove('show'); }, 3200);
  },

  // ---------- Sidebar mobile toggle ----------
  initSidebarToggle() {
    const burger = document.getElementById('burgerBtn');
    const sidebar = document.querySelector('.sidebar');
    if (!burger || !sidebar) return;
    burger.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== burger && !burger.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  },

  // ---------- Populate sidebar user block ----------
  renderUserBlock(user, roleLabel) {
    const nameEl = document.getElementById('sbUserName');
    const roleEl = document.getElementById('sbUserRole');
    const avatarEl = document.getElementById('sbUserAvatar');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = roleLabel || user.role || '';
    if (avatarEl) avatarEl.textContent = this.initials(user.name);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SkillWay.initSidebarToggle();
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      SkillWay.logout();
    });
  }
});
