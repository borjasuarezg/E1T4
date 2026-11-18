const vistaListado = document.getElementById('vistaListado');
const vistaFormulario = document.getElementById('vistaFormulario');
const formCard = document.getElementById('formEtiqueta');
const tbody = document.getElementById('tbodyEtiquetas');
const etiquetaForm = document.getElementById('etiquetaForm');
const selEquipo = document.getElementById('equipo_id');
const selGela = document.getElementById('gela_id');

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
});

function abrirFormulario() {
    etiquetaForm.reset();
    etiquetaForm.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    if (vistaListado) vistaListado.hidden = true;
    const destino = vistaFormulario || formCard;
    if (destino) {
        destino.hidden = false;
        destino.style.display = 'block';
        destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.getElementById('codigo').focus({ preventScroll: true });
}

function cerrarFormulario() {
    const destino = vistaFormulario || formCard;
    if (destino) {
        destino.hidden = true;
        destino.style.display = 'none';
    }
    if (vistaListado) vistaListado.hidden = false;
}

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
    tbody.innerHTML = etiquetas.map(et => {
        const codigo = et.etiketa ?? et.codigo ?? '';
        const equipo = et.baliabide_izena ?? et.equipo_nombre ?? '—';
        const gelaActual = et.gelaId ?? et.gela_id ?? '';
        const fecha = et.erosketa_data ?? et.fecha_alta ?? '—';
        return `
        <tr data-id="${et.id}">
            <td><strong>${escapeHtml(codigo)}</strong></td>
            <td>${escapeHtml(equipo)}</td>
            <td>
                <select class="sel-gela-tabla" data-id="${et.id}">
                    <option value="">Gela gabe</option>
                    ${gelas.map(g => `<option value="${g.id}" ${g.id == gelaActual ? 'selected' : ''}>${escapeHtml(g.nombre)}</option>`).join('')}
                </select>
            </td>
            <td>${escapeHtml(fecha)}</td>
            <td style="text-align:right"><button type="button" class="btn btn-danger" data-action="baja">Ezabatu</button></td>
        </tr>`;
    }).join('');
}

tbody.addEventListener('change', async (e) => {
    if (!e.target.classList.contains('sel-gela-tabla')) return;
    const id = e.target.dataset.id;
    const gelaId = e.target.value ? Number(e.target.value) : null;
    try {
        await api.patch(`/etiquetas/${id}/ubicacion`, { gelaId });
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

document.getElementById('btnNuevaEtiqueta').addEventListener('click', abrirFormulario);
document.getElementById('btnCancelarEtiqueta').addEventListener('click', cerrarFormulario);

etiquetaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigoEl = document.getElementById('codigo');
    if (!validateRequired(codigoEl) || !validateSelect(selEquipo) || !validateSelect(selGela)) return;

    try {
        await api.post('/etiquetas', {
            etiketa: codigoEl.value.trim(),
            baliabideId: Number(selEquipo.value),
            gelaId: Number(selGela.value)
        });
        cerrarFormulario();
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