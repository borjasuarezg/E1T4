const vistaListado = document.getElementById('vistaListado');
const vistaFormulario = document.getElementById('vistaFormulario');
const formCard = document.getElementById('formUsuario');
const tbody = document.getElementById('tbodyUsuarios');
const usuarioForm = document.getElementById('usuarioForm');

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
});

function abrirFormulario() {
    usuarioForm.reset();
    usuarioForm.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    if (vistaListado) vistaListado.hidden = true;
    const destino = vistaFormulario || formCard;
    if (destino) {
        destino.hidden = false;
        destino.style.display = 'block';
        destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.getElementById('username').focus({ preventScroll: true });
}

function cerrarFormulario() {
    const destino = vistaFormulario || formCard;
    if (destino) {
        destino.hidden = true;
        destino.style.display = 'none';
    }
    if (vistaListado) vistaListado.hidden = false;
}

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

document.getElementById('btnNuevoUsuario').addEventListener('click', abrirFormulario);
document.getElementById('btnCancelarUsuario').addEventListener('click', cerrarFormulario);

usuarioForm.addEventListener('submit', async (e) => {
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
        cerrarFormulario();
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