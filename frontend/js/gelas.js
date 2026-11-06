/**
 * Módulo: gelas.js
 * Web cliente para gestión de gelas.
 * Usa funciones globales de base.js: initSesion, escapeHtml, logout, validate*, showToast
 */

const tbody = document.getElementById('tbodyGelas');
const formCard = document.getElementById('formGela');

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function initSesion() {
    const { user } = await api.get('/auth/me');
    if (!user) { window.location.href = 'login.html'; return; }
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userRole').textContent = user.rol;
    if (user.rol === 'admin') document.getElementById('navUsuarios').hidden = false;
}

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
    window.location.href = 'login.html';
});

async function cargarGelas() {
    const gelas = await api.get('/gelas');
    tbody.innerHTML = gelas.length ? gelas.map(g => `
        <tr data-id="${g.id}">
            <td>${escapeHtml(g.nombre)}</td>
            <td>${escapeHtml(g.taldea || '—')}</td>
            <td style="text-align:right"><button class="btn btn-danger" data-action="ezabatu">Ezabatu</button></td>
        </tr>`).join('') : `<tr><td colspan="3" style="color:var(--text-mute)">Ez dago gelarik.</td></tr>`;
}

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action="ezabatu"]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (!confirm('Ziur zaude gela hau ezabatu nahi duzula?')) return;
    try {
        await api.delete(`/gelas/${id}`);
        await cargarGelas();
        showToast('Gela ongi ezabatu da', 'success');
    } catch (err) { showToast(err.message, 'error'); }
});

document.getElementById('btnNuevaGela').addEventListener('click', () => {
    document.getElementById('gelaForm').reset();
    formCard.style.display = 'block';
});

document.getElementById('btnCancelarGela').addEventListener('click', () => formCard.style.display = 'none');

document.getElementById('gelaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombreEl = document.getElementById('nombre');
    if (!validateRequired(nombreEl)) return;
    try {
        await api.post('/gelas', {
            nombre: nombreEl.value.trim(),
            taldea: document.getElementById('taldea').value.trim()
        });
        formCard.style.display = 'none';
        await cargarGelas();
        showToast('Gela ongi sortu da', 'success');
    } catch (err) { showToast(err.message, 'error'); }
});

(async function start() {
    await initSesion();
    await cargarGelas();
})();