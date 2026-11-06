/**
 * Módulo: usuarios.js
 * Web cliente para gestión de usuarios.
 * Usa funciones globales de base.js: initSesion, escapeHtml, logout, validate*, showToast
 */

const tbody = document.getElementById('tbodyUsuarios');
const formCard = document.getElementById('formUsuario');

async function initSesion() {
    const { user } = await api.get('/auth/me');
    if (!user) { window.location.href = 'login.html'; return; }
    if (user.rol !== 'admin') { window.location.href = 'index.html'; return; }
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userRole').textContent = user.rol;
}

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
    window.location.href = 'login.html';
});

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function cargarUsuarios() {
    const usuarios = await api.get('/usuarios');
    if (!usuarios.length) {
        tbody.innerHTML = `<tr><td colspan="2" style="color:var(--text-mute)">Ez dago erabiltzailerik.</td></tr>`;
        return;
    }
    tbody.innerHTML = usuarios.map(u => `
        <tr>
            <td>${escapeHtml(u.username)}</td>
            <td><span class="badge">${escapeHtml(u.rol)}</span></td>
        </tr>`).join('');
}

document.getElementById('btnNuevoUsuario').addEventListener('click', () => {
    document.getElementById('usuarioForm').reset();
    formCard.style.display = 'block';
});

document.getElementById('btnCancelarUsuario').addEventListener('click', () => formCard.style.display = 'none');

document.getElementById('usuarioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');

    const okUser = validateRequired(usernameEl);
    const okPass = validateMinLength(passwordEl, 8);
    if (!(okUser && okPass)) return;

    try {
        await api.post('/auth/register', {
            username: usernameEl.value.trim(),
            password: passwordEl.value,
            rol: document.getElementById('rol').value
        });
        formCard.style.display = 'none';
        await cargarUsuarios();
    } catch (err) { showToast(err.message, 'error'); }
});

(async function start() {
    await initSesion();
    await cargarUsuarios();
})();