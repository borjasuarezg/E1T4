const tbody       = document.getElementById('tbodyEquipos');
const formCard    = document.getElementById('formEquipo');
const equipoForm  = document.getElementById('equipoForm');
const formTitulo  = document.getElementById('formTitulo');
const selCategoria = document.getElementById('categoria_id');

let categoriasCache = [];

/** Comprueba la sesión y pinta los datos del usuario en la barra lateral. */
async function initSesion() {
    try {
        const { user } = await api.get('/auth/me');
        if (!user) { window.location.href = 'login.html'; return; }
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.rol;
        if (user.rol === 'admin') {
            document.getElementById('navUsuarios').hidden = false;
        }
    } catch {
        window.location.href = 'login.html';
    }
}

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await api.post('/auth/logout', {});
    window.location.href = 'login.html';
});

/** Carga categorías para el <select> del formulario. */
async function cargarCategorias() {
    categoriasCache = await api.get('/categorias');
    selCategoria.innerHTML = '<option value="">Aukeratu…</option>' +
        categoriasCache.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

/** Pinta la tabla de equipos. */
function renderEquipos(equipos) {
    if (!equipos.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-mute)">Ez dago ekiporik.</td></tr>`;
        return;
    }
    tbody.innerHTML = equipos.map(eq => `
        <tr data-id="${eq.id}">
            <td>${escapeHtml(eq.nombre)}</td>
            <td>${escapeHtml(eq.marca)} / ${escapeHtml(eq.modelo)}</td>
            <td>${escapeHtml(eq.categoria_nombre)}</td>
            <td><span class="badge ${eq.stock > 0 ? 'stock-ok' : 'stock-low'}">${eq.stock} unitate</span></td>
            <td style="text-align:right">
                <button class="btn btn-ghost" data-action="editar">Editatu</button>
                <button class="btn btn-danger" data-action="ezabatu">Ezabatu</button>
            </td>
        </tr>
    `).join('');
}

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

async function cargarEquipos() {
    const equipos = await api.get('/equipos');
    renderEquipos(equipos);
}

/* ---------- Alta / edición ---------- */

document.getElementById('btnNuevo').addEventListener('click', () => {
    equipoForm.reset();
    document.getElementById('equipoId').value = '';
    formTitulo.textContent = 'Ekipo berria';
    formCard.style.display = 'block';
});

document.getElementById('btnCancelar').addEventListener('click', () => {
    formCard.style.display = 'none';
});

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const tr = btn.closest('tr');
    const id = tr.dataset.id;

    if (btn.dataset.action === 'ezabatu') {
        if (!confirm('Ziur zaude ekipo hau ezabatu nahi duzula?')) return;
        await api.delete(`/equipos/${id}`);
        await cargarEquipos();
    }

    if (btn.dataset.action === 'editar') {
        const eq = await api.get(`/equipos/${id}`);
        document.getElementById('equipoId').value = eq.id;
        document.getElementById('nombre').value = eq.nombre;
        document.getElementById('marca').value = eq.marca;
        document.getElementById('modelo').value = eq.modelo;
        document.getElementById('descripcion').value = eq.descripcion || '';
        document.getElementById('stock').value = eq.stock;
        document.getElementById('es_fungible').checked = !!eq.es_fungible;
        selCategoria.value = eq.categoria_id;
        formTitulo.textContent = 'Ekipoa editatu';
        formCard.style.display = 'block';
    }
});

equipoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // --- Validación en cliente (se repite en servidor) ---
    const okNombre = validateRequired(document.getElementById('nombre'));
    const okMarca = validateRequired(document.getElementById('marca'));
    const okModelo = validateRequired(document.getElementById('modelo'));
    const okCategoria = validateSelect(selCategoria);
    const okStock = validatePositiveNumber(document.getElementById('stock'));

    if (!(okNombre && okMarca && okModelo && okCategoria && okStock)) return;

    const payload = {
        nombre: document.getElementById('nombre').value.trim(),
        marca: document.getElementById('marca').value.trim(),
        modelo: document.getElementById('modelo').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim(),
        categoria_id: Number(selCategoria.value),
        stock: Number(document.getElementById('stock').value),
        es_fungible: document.getElementById('es_fungible').checked,
    };

    const id = document.getElementById('equipoId').value;
    try {
        if (id) {
            await api.put(`/equipos/${id}`, payload);
        } else {
            await api.post('/equipos', payload);
        }
        formCard.style.display = 'none';
        await cargarEquipos();
    } catch (err) {
        alert(err.message); // en producción: sustituir por un toast no bloqueante
    }
});

/* ---------- Arranque ---------- */
(async function start() {
    await initSesion();
    await cargarCategorias();
    await cargarEquipos();
})();
