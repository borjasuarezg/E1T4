/**
 * Módulo: etiquetas.js
 * Web cliente para gestión de etiquetas.
 * Usa funciones globales de base.js: initSesion, escapeHtml, logout, validate*, showToast
 */

const tbody = document.getElementById('tbodyEtiquetas');
const formCard = document.getElementById('formEtiqueta');
const selEquipo = document.getElementById('equipo_id');
const selGela = document.getElementById('gela_id');

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

async function cargarSelects() {
    const [equipos, gelas] = await Promise.all([api.get('/equipos'), api.get('/gelas')]);
    selEquipo.innerHTML = '<option value="">Aukeratu…</option>' +
        equipos.map(e => `<option value="${e.id}">${escapeHtml(e.nombre)}</option>`).join('');
    selGela.innerHTML = '<option value="">Aukeratu…</option>' +
        gelas.map(g => `<option value="${g.id}">${escapeHtml(g.nombre)}</option>`).join('');
    return gelas;
}

async function cargarEtiquetas(gelas) {
    const etiquetas = await api.get('/etiquetas');
    if (!etiquetas.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-mute)">Ez dago etiketarik.</td></tr>`;
        return;
    }
    tbody.innerHTML = etiquetas.map(et => `
        <tr data-id="${et.id}">
            <td><strong>${escapeHtml(et.codigo)}</strong></td>
            <td>${escapeHtml(et.equipo_nombre)}</td>
            <td>
                <select class="sel-gela-tabla" data-id="${et.id}">
                    <option value="">Gela gabe</option>
                    ${gelas.map(g => `<option value="${g.id}" ${g.id == et.gela_id ? 'selected' : ''}>${escapeHtml(g.nombre)}</option>`).join('')}
                </select>
            </td>
            <td>${et.fecha_alta || '—'}</td>
            <td style="text-align:right"><button class="btn btn-danger" data-action="baja">Ezabatu</button></td>
        </tr>
    `).join('');
}

tbody.addEventListener('change', async (e) => {
    if (!e.target.classList.contains('sel-gela-tabla')) return;
    const id = e.target.dataset.id;
    try {
        await api.patch(`/etiquetas/${id}/ubicacion`, { gela_id: Number(e.target.value) });
        showToast('Kokapena ongi eguneratu da', 'success');
    } catch (err) { showToast(err.message, 'error'); }
});

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action="baja"]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (!confirm('Ziur zaude etiketa hau ezabatu nahi duzula?')) return;
    try {
        await api.delete(`/etiquetas/${id}`);
        const gelas = await cargarSelects();
        await cargarEtiquetas(gelas);
        showToast('Etiketa ongi ezabatu da', 'success');
    } catch (err) { showToast(err.message, 'error'); }
});

document.getElementById('btnNuevaEtiqueta').addEventListener('click', () => {
    document.getElementById('etiquetaForm').reset();
    formCard.style.display = 'block';
});

document.getElementById('btnCancelarEtiqueta').addEventListener('click', () => formCard.style.display = 'none');

document.getElementById('etiquetaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigoEl = document.getElementById('codigo');
    if (!validateRequired(codigoEl) || !validateSelect(selEquipo) || !validateSelect(selGela)) return;

    try {
        await api.post('/etiquetas', {
            codigo: codigoEl.value.trim(),
            equipo_id: Number(selEquipo.value),
            gela_id: Number(selGela.value)
        });
        formCard.style.display = 'none';
        const gelas = await cargarSelects();
        await cargarEtiquetas(gelas);
        showToast('Etiketa ongi sortu da', 'success');
    } catch (err) { showToast(err.message, 'error'); }
});

(async function start() {
    await initSesion();
    const gelas = await cargarSelects();
    await cargarEtiquetas(gelas);
})();