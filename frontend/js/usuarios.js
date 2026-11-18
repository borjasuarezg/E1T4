const tbody = document.getElementById('tbodyUsuarios');
const formCard = document.getElementById('formUsuario');

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
});

async function cargarUsuarios() {
    const usuarios = await api.get('/usuarios');
    if (!usuarios.length) {
        tbody.innerHTML = `<tr><td colspan="3" style="color:var(--text-mute)">Ez dago erabiltzailerik.</td></tr>`;
        return;
    }
    tbody.innerHTML = usuarios.map(u => `
        <tr data-id="${u.id}">
            <td>${escapeHtml(u.username)}</td>
            <td><span class="badge">${escapeHtml(u.rol)}</span></td>
            <td style="text-align:right"><button type="button" class="btn btn-danger" data-action="ezabatu">Ezabatu</button></td>
        </tr>`).join('');
}

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action="ezabatu"]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (!confirm('Ziur zaude erabiltzaile hau ezabatu nahi duzula?')) return;
    try {
        await api.delete(`/usuarios/${id}`);
        await cargarUsuarios();
        showToast('Erabiltzailea ongi ezabatu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

document.getElementById('btnNuevoUsuario').addEventListener('click', () => {
    document.getElementById('usuarioForm').reset();
    formCard.style.display = 'block';
});

document.getElementById('btnCancelarUsuario').addEventListener('click', () => {
    formCard.style.display = 'none';
});

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
        showToast('Erabiltzailea ongi sortu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

(async function start() {
    const user = await initSesion(true);
    if (!user) return;
    try {
        await cargarUsuarios();
    } catch (err) {
        showToast(err.message, 'error');
    }
})();