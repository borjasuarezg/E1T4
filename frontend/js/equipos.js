const vistaListado = document.getElementById('vistaListado');
const vistaFormulario = document.getElementById('vistaFormulario');
const tbody = document.getElementById('tbodyEquipos');
const equipoForm = document.getElementById('equipoForm');
const formTitulo = document.getElementById('formTitulo');
const selCategoria = document.getElementById('categoria_id');

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

function abrirFormulario(titulo = 'Ekipo berria') {
    formTitulo.textContent = titulo;
    equipoForm.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    vistaListado.hidden = true;
    vistaFormulario.hidden = false;
}

function cerrarFormulario() {
    vistaFormulario.hidden = true;
    vistaListado.hidden = false;
}

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
                <button class="btn btn-ghost" data-action="editar">Editatu</button>
                <button class="btn btn-danger" data-action="ezabatu">Ezabatu</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnNuevo').addEventListener('click', () => {
    equipoForm.reset();
    document.getElementById('equipoId').value = '';
    abrirFormulario('Ekipo berria');
    document.getElementById('nombre').focus();
});

document.getElementById('btnCancelar').addEventListener('click', cerrarFormulario);

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
        } catch (err) { showToast(err.message, 'error'); }
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
            abrirFormulario('Ekipoa editatu');
        } catch (err) { showToast(err.message, 'error'); }
    }
});

equipoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombreEl = document.getElementById('nombre');
    if (!validateRequired(nombreEl) || !validateSelect(selCategoria)) return;

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
        cerrarFormulario();
        await cargarEquipos();
    } catch (err) { showToast(err.message, 'error'); }
});

(async function start() {
    await initSesion();
    await cargarCategorias();
    await cargarEquipos();
})();