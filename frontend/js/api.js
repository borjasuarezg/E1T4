/**
 * Envoltorio de Fetch para hablar con el backend (server.talde4.edu).
 * `credentials: 'include'` es necesario porque backend y frontend viven
 * en subdominios distintos y la sesión viaja en una cookie httpOnly.
 */
const API_BASE = `${window.location.protocol}//server.talde4.edu/api`;

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

const api = {
    get:    (path)         => apiFetch(path),
    post:   (path, body)   => apiFetch(path, { method: 'POST',  body: JSON.stringify(body) }),
    put:    (path, body)   => apiFetch(path, { method: 'PUT',   body: JSON.stringify(body) }),
    patch:  (path, body)   => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (path)         => apiFetch(path, { method: 'DELETE' }),
};