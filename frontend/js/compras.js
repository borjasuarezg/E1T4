const vistaListado = document.getElementById('vistaListado');
const vistaFormulario = document.getElementById('vistaFormulario');
const tbody = document.getElementById('tbodyCompras');
const form = document.getElementById('compraForm');
const selEquipo = document.getElementById('equipo_id');
const btnGuardar = document.getElementById('btnGuardar');

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

/* ---------- Cambio de vista (Listado <-> Formulario) ---------- */
async function abrirFormulario() {
    vistaListado.hidden = true;
    vistaFormulario.hidden = false;
    form.reset();
    form.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    try {
        await cargarEquiposSelect();
    } catch (err) {
        if (typeof showToast === 'function') showToast(err.message, 'error');
    }
}

function cerrarFormulario() {
    vistaFormulario.hidden = true;
    vistaListado.hidden = false;
}

document.getElementById('btnNuevaCompra').addEventListener('click', abrirFormulario);
document.getElementById('btnCancelar').addEventListener('click', cerrarFormulario);

/* ---------- Sesión ---------- */
async function initSesion() {
    const { user } = await api.get('/auth/me');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userRole').textContent = user.rol;
    if (user.rol === 'admin') {
        document.getElementById('navUsuarios').hidden = false;
    }
}

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
    window.location.href = 'login.html';
});

/* ---------- Listado y Select ---------- */
async function cargarCompras() {
    const compras = await api.get('/compras');
    tbody.innerHTML = compras.length ? compras.map(c => `
        <tr>
            <td>${escapeHtml(c.equipo_nombre)}</td>
            <td>${escapeHtml(c.fecha_compra)}</td>
            <td><span class="badge">${c.cantidad} unitez</span></td>
        </tr>`).join('') : `<tr><td colspan="3" style="color:var(--text-mute)">Ez dago erosketarik.</td></tr>`;
}

async function cargarEquiposSelect() {
    const equipos = await api.get('/equipos');
    selEquipo.innerHTML = '<option value="">Aukeratu…</option>' +
        equipos.map(e => `<option value="${e.id}">${escapeHtml(e.nombre)}</option>`).join('');
}

/* ---------- Envío del formulario ---------- */
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fechaEl = document.getElementById('fecha_compra');
    const cantidadEl = document.getElementById('cantidad');

    const okEquipo = validateSelect(selEquipo);
    const okFecha = validateRequired(fechaEl);
    const okCantidad = setFieldState(cantidadEl.closest('.field'), Number(cantidadEl.value) >= 1);
    if (!(okEquipo && okFecha && okCantidad)) return;

    btnGuardar.disabled = true;
    try {
        await api.post('/compras', {
            equipo_id: Number(selEquipo.value),
            fecha_compra: fechaEl.value,
            cantidad: Number(cantidadEl.value)
        });
        cerrarFormulario();
        await cargarCompras();
        if (typeof showToast === 'function') showToast('Erosketa ongi erregistratu da', 'success');
    } catch (err) {
        if (typeof showToast === 'function') showToast(err.message, 'error');
    } finally {
        btnGuardar.disabled = false;
    }
});

(async function start() {
    await initSesion();
    await cargarCompras();
})();