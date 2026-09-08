const tbody = document.getElementById('tbodyUsuarios');
const formCard = document.getElementById('formUsuario');

async function initSesion() {
    try {
        const { user } = await api.get('/auth/me');
        if (!user) { window.location.href = 'login.html'; return; }
        if (user.rol !== 'admin') { window.location.href = 'index.html'; return; } // protección extra en cliente
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.rol;
    } catch { window.location.href = 'login.html'; }
}
document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await api.post('/auth/logout', {});
    window.location.href = 'login.html';
});

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function cargarUsuarios() {
    const usuarios = await api.get('/usuarios');
    tbody.innerHTML = usuarios.map(u => `
        <tr>
            <td>${escapeHtml(u.username)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td><span class="badge">${u.rol}</span></td>
            <td>${u.activo ? 'Bai' : 'Ez'}</td>
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
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');

    const okUser = validateRequired(usernameEl);
    const okEmail = validateEmail(emailEl);
    const okPass = validateMinLength(passwordEl, 8);
    if (!(okUser && okEmail && okPass)) return;

    try {
        // El alta real la hace /api/auth/register (solo accesible por admin, comprobado en servidor)
        await api.post('/auth/register', {
            username: usernameEl.value.trim(),
            email: emailEl.value.trim(),
            password: passwordEl.value,
            rol: document.getElementById('rol').value,
        });
        formCard.style.display = 'none';
        await cargarUsuarios();
    } catch (err) { alert(err.message); }
});

(async function start() {
    await initSesion();
    await cargarUsuarios();
})();
