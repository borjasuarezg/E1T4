const tbody = document.getElementById('tbodyCompras');
const formCard = document.getElementById('formCompra');
const selEquipo = document.getElementById('equipo_id');

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
    return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function cargarEquiposSelect() {
    const equipos = await api.get('/equipos');
    selEquipo.innerHTML = '<option value="">Aukeratu…</option>' +
        equipos.map(e => `<option value="${e.id}">${escapeHtml(e.nombre)}</option>`).join('');
}

async function cargarCompras() {
    const compras = await api.get('/compras');
    tbody.innerHTML = compras.length ? compras.map(c => `
        <tr>
            <td>${escapeHtml(c.equipo_nombre)}</td>
            <td>${c.fecha_compra}</td>
            <td>${c.cantidad}</td>
            <td>${escapeHtml(c.proveedor || '—')}</td>
        </tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-mute)">Ez dago erosketarik.</td></tr>`;
}

document.getElementById('btnNuevaCompra').addEventListener('click', () => {
    document.getElementById('compraForm').reset();
    formCard.style.display = 'block';
});
document.getElementById('btnCancelarCompra').addEventListener('click', () => formCard.style.display = 'none');

document.getElementById('compraForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fechaEl = document.getElementById('fecha_compra');
    const cantidadEl = document.getElementById('cantidad');

    const okEquipo = validateSelect(selEquipo);
    const okFecha = validateRequired(fechaEl);
    const okCantidad = setFieldState(cantidadEl.closest('.field'), Number(cantidadEl.value) >= 1);
    if (!(okEquipo && okFecha && okCantidad)) return;

    try {
        await api.post('/compras', {
            equipo_id: Number(selEquipo.value),
            fecha_compra: fechaEl.value,
            cantidad: Number(cantidadEl.value),
            proveedor: document.getElementById('proveedor').value.trim(),
        });
        formCard.style.display = 'none';
        await cargarCompras();
    } catch (err) { alert(err.message); }
});

(async function start() {
    await initSesion();
    await cargarEquiposSelect();
    await cargarCompras();
})();
