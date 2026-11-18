const tbody = document.getElementById('tbodyEtiquetas');
const formCard = document.getElementById('formEtiqueta');
const selEquipo = document.getElementById('equipo_id');
const selGela = document.getElementById('gela_id');

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
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
            <td><strong>${escapeHtml(et.etiketa)}</strong></td>
            <td>${escapeHtml(et.baliabide_izena)}</td>
            <td>
                <select class="sel-gela-tabla" data-id="${et.id}">
                    <option value="">Gela gabe</option>
                    ${gelas.map(g => `<option value="${g.id}" ${g.id == et.gelaId ? 'selected' : ''}>${escapeHtml(g.nombre)}</option>`).join('')}
                </select>
            </td>
            <td>${et.erosketa_data || '—'}</td>
            <td style="text-align:right"><button type="button" class="btn btn-danger" data-action="baja">Ezabatu</button></td>
        </tr>
    `).join('');
}

tbody.addEventListener('change', async (e) => {
    if (!e.target.classList.contains('sel-gela-tabla')) return;
    const id = e.target.dataset.id;
    const val = e.target.value;
    try {
        await api.patch(`/etiquetas/${id}/ubicacion`, { gelaId: val ? Number(val) : null });
        showToast('Kokapena ongi eguneratu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
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
    } catch (err) {
        showToast(err.message, 'error');
    }
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
    const okCodigo = validateRequired(codigoEl);
    const okEquipo = validateSelect(selEquipo);
    const okGela = validateSelect(selGela);
    if (!(okCodigo && okEquipo && okGela)) return;

    try {
        await api.post('/etiquetas', {
            etiketa: codigoEl.value.trim(),
            baliabideId: Number(selEquipo.value),
            gelaId: Number(selGela.value)
        });
        formCard.style.display = 'none';
        const gelas = await cargarSelects();
        await cargarEtiquetas(gelas);
        showToast('Etiketa ongi sortu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

(async function start() {
    const user = await initSesion();
    if (!user) return;
    try {
        const gelas = await cargarSelects();
        await cargarEtiquetas(gelas);
    } catch (err) {
        showToast(err.message, 'error');
    }
})();