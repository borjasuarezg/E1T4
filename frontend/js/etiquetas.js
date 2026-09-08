const tbody = document.getElementById('tbodyEtiquetas');
const formCard = document.getElementById('formEtiqueta');
const selEquipo = document.getElementById('equipo_id');
const selGela = document.getElementById('gela_id');

async function initSesion() {
    try {
        const { user } = await api.get('/auth/me');
        if (!user) { window.location.href = 'login.html'; return; }
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.rol;
        if (user.rol === 'admin') document.getElementById('navUsuarios').hidden = false;
    } catch { window.location.href = 'login.html'; }
}

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await api.post('/auth/logout', {});
    window.location.href = 'login.html';
});

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

async function cargarSelects() {
    const [equipos, gelas] = await Promise.all([api.get('/equipos'), api.get('/gelas')]);
    selEquipo.innerHTML = '<option value="">Aukeratu…</option>' +
        equipos.map(e => `<option value="${e.id}">${escapeHtml(e.nombre)} (stock: ${e.stock})</option>`).join('');
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
            <td><span class="tag-code">${escapeHtml(et.codigo)}</span></td>
            <td>${escapeHtml(et.equipo_nombre)}</td>
            <td>
                <select class="sel-gela" data-id="${et.id}">
                    ${gelas.map(g => `<option value="${g.id}" ${g.id === et.gela_id ? 'selected' : ''}>${escapeHtml(g.nombre)}</option>`).join('')}
                </select>
            </td>
            <td>${et.fecha_alta}</td>
            <td style="text-align:right"><button class="btn btn-danger" data-action="baja">Baja eman</button></td>
        </tr>
    `).join('');
}

tbody.addEventListener('change', async (e) => {
    if (!e.target.classList.contains('sel-gela')) return;
    const id = e.target.dataset.id;
    await api.patch(`/etiquetas/${id}/ubicacion`, { gela_id: Number(e.target.value) });
});

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action="baja"]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (!confirm('Ziur zaude etiketa honi baja eman nahi diozula?')) return;
    await api.delete(`/etiquetas/${id}`);
    const gelas = await cargarSelects();
    await cargarEtiquetas(gelas);
});

document.getElementById('btnNuevaEtiqueta').addEventListener('click', () => {
    document.getElementById('etiquetaForm').reset();
    formCard.style.display = 'block';
});
document.getElementById('btnCancelarEtiqueta').addEventListener('click', () => {
    formCard.style.display = 'none';
});

document.getElementById('etiquetaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigoEl = document.getElementById('codigo');
    const okCodigo = /^[A-Za-z0-9-]{3,40}$/.test(codigoEl.value.trim());
    setFieldState(codigoEl.closest('.field'), okCodigo);
    const okEquipo = validateSelect(selEquipo);
    const okGela = validateSelect(selGela);
    if (!(okCodigo && okEquipo && okGela)) return;

    try {
        await api.post('/etiquetas', {
            codigo: codigoEl.value.trim(),
            equipo_id: Number(selEquipo.value),
            gela_id: Number(selGela.value),
        });
        formCard.style.display = 'none';
        const gelas = await cargarSelects();
        await cargarEtiquetas(gelas);
    } catch (err) {
        alert(err.message);
    }
});

(async function start() {
    await initSesion();
    const gelas = await cargarSelects();
    await cargarEtiquetas(gelas);
})();
