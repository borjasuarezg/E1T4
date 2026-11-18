const tbody = document.getElementById('tbodyEquipos');
const formCard = document.getElementById('formEquipo');
const equipoForm = document.getElementById('equipoForm');
const formTitulo = document.getElementById('formTitulo');
const selCategoria = document.getElementById('categoria_id');

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
});

async function cargarCategorias() {
    const cats = await api.get('/categorias');
    selCategoria.innerHTML = '<option value="">Aukeratu…</option>' +
        cats.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join('');
}

async function cargarEquipos() {
    const equipos = await api.get('/equipos');
    if (!equipos.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-mute)">Ez dago ekiporik.</td></tr>`;
        return;
    }
    tbody.innerHTML = equipos.map(eq => `
        <tr data-id="${eq.id}">
            <td>${escapeHtml(eq.nombre)}</td>
            <td>${escapeHtml(eq.marca || '—')} / ${escapeHtml(eq.modelo || '—')}</td>
            <td>${escapeHtml(eq.categoria_nombre || '—')}</td>
            <td><span class="badge">${eq.stock} unitez</span></td>
            <td style="text-align:right">
                <button type="button" class="btn btn-ghost" data-action="editar">Editatu</button>
                <button type="button" class="btn btn-danger" data-action="ezabatu">Ezabatu</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnNuevo').addEventListener('click', () => {
    equipoForm.reset();
    document.getElementById('equipoId').value = '';
    formTitulo.textContent = 'Ekipo berria';
    formCard.style.display = 'block';
    document.getElementById('nombre').focus();
});

document.getElementById('btnCancelar').addEventListener('click', () => {
    formCard.style.display = 'none';
});

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;

    if (btn.dataset.action === 'ezabatu') {
        if (!confirm('Ziur zaude ekipo hau ezabatu nahi duzula?')) return;
        try {
            await api.delete(`/equipos/${id}`);
            showToast('Ekipoa ezabatu da', 'success');
            await cargarEquipos();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    if (btn.dataset.action === 'editar') {
        try {
            const eq = await api.get(`/equipos/${id}`);
            document.getElementById('equipoId').value = eq.id || '';
            document.getElementById('nombre').value = eq.nombre || '';
            document.getElementById('marca').value = eq.marca || '';
            document.getElementById('modelo').value = eq.modelo || '';
            document.getElementById('descripcion').value = eq.deskribapena || '';
            selCategoria.value = eq.categoria_id || '';
            formTitulo.textContent = 'Ekipoa editatu';
            formCard.style.display = 'block';
        } catch (err) {
            showToast(err.message, 'error');
        }
    }
});

equipoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombreEl = document.getElementById('nombre');
    const okNombre = validateRequired(nombreEl);
    const okCat = validateSelect(selCategoria);
    if (!(okNombre && okCat)) return;

    const payload = {
        nombre: nombreEl.value.trim(),
        marca: document.getElementById('marca').value.trim(),
        modelo: document.getElementById('modelo').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim(),
        categoria_id: Number(selCategoria.value)
    };

    const id = document.getElementById('equipoId').value;
    try {
        if (id) {
            await api.put(`/equipos/${id}`, payload);
            showToast('Ekipoa ongi eguneratu da', 'success');
        } else {
            await api.post('/equipos', payload);
            showToast('Ekipoa ongi sortu da', 'success');
        }
        formCard.style.display = 'none';
        await cargarEquipos();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

(async function start() {
    const user = await initSesion();
    if (!user) return;
    try {
        await cargarCategorias();
        await cargarEquipos();
    } catch (err) {
        showToast(err.message, 'error');
    }
})();