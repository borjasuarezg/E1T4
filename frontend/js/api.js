/**
 * Envoltorio de Fetch para hablar con el backend (server.talde4.edu).
 * `credentials: 'include'` es necesario porque backend y frontend viven
 * en subdominios distintos y la sesión viaja en una cookie httpOnly.
 * Se usa token CSRF en headers X-CSRF-Token para operaciones de escritura.
 */
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

async function initSesion() {
    const res = await apiFetch('/auth/me');
    if (!res || !res.user) { window.location.href = 'login.html'; return; }
    document.getElementById('userName').textContent = res.user.username;
    document.getElementById('userRole').textContent = res.user.rol;
    if (res.user.rol === 'admin') document.getElementById('navUsuarios').hidden = false;
    // Almacenar token CSRF para peticiones posteriores
    csrfToken = res.csrf_token || '';
}

function getApiOptions(method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (csrfToken && method !== 'GET') {
        headers['X-CSRF-Token'] = csrfToken;
    }
    const options = {
        credentials: 'include',
        headers: headers,
    };
    if (body) {
        options.method = method;
        options.body = JSON.stringify(body);
    }
    return options;
}

const api = {
    get:    (path)         => apiFetch(path, getApiOptions()),
    post:   (path, body)   => apiFetch(path, getApiOptions('POST', body)),
    put:    (path, body)   => apiFetch(path, getApiOptions('PUT', body)),
    patch:  (path, body)   => apiFetch(path, getApiOptions('PATCH', body)),
    delete: (path)         => apiFetch(path, getApiOptions('DELETE')),
};