const API_BASE = window.API_BASE || `${window.location.protocol}//server.talde4.edu/api`;
let csrfToken = '';

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    });

    let data = null;
    try { data = await res.json(); } catch (_) {}

    if (!res.ok) {
        const msg = data?.error || data?.errores?.join(', ') || `Errorea (${res.status})`;
        throw new Error(msg);
    }
    return data;
}

async function initSesion(requireAdmin = false) {
    try {
        const res = await apiFetch('/auth/me');
        if (!res || !res.user) {
            window.location.href = 'login.html';
            return null;
        }
        if (requireAdmin && res.user.rol !== 'admin') {
            window.location.href = 'index.html';
            return null;
        }
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        const navUsuarios = document.getElementById('navUsuarios');

        if (userNameEl) userNameEl.textContent = res.user.username;
        if (userRoleEl) userRoleEl.textContent = res.user.rol;
        if (navUsuarios) navUsuarios.hidden = res.user.rol !== 'admin';

        csrfToken = res.csrf_token || '';
        return res.user;
    } catch (_) {
        window.location.href = 'login.html';
        return null;
    }
}
window.initSesion = initSesion;

function getApiOptions(method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (csrfToken && method !== 'GET') {
        headers['X-CSRF-Token'] = csrfToken;
    }
    const options = {
        method: method,
        credentials: 'include',
        headers: headers,
    };
    if (body !== null) {
        options.body = JSON.stringify(body);
    }
    return options;
}

const api = {
    get:    (path)       => apiFetch(path, getApiOptions('GET')),
    post:   (path, body) => apiFetch(path, getApiOptions('POST', body)),
    put:    (path, body) => apiFetch(path, getApiOptions('PUT', body)),
    patch:  (path, body) => apiFetch(path, getApiOptions('PATCH', body)),
    delete: (path)       => apiFetch(path, getApiOptions('DELETE')),
};