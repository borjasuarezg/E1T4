const tbody = document.getElementById('tbodyCompras');
const formCard = document.getElementById('formCompra');
const selEquipo = document.getElementById('equipo_id');

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
});

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
            <td><span class="badge">${c.cantidad} unitez</span></td>
        </tr>`).join('') : `<tr><td colspan="3" style="color:var(--text-mute)">Ez dago erosketarik.</td></tr>`;
}

document.getElementById('btnNuevaCompra').addEventListener('click', () => {
    document.getElementById('compraForm').reset();
    formCard.style.display = 'block';
});

document.getElementById('btnCancelarCompra').addEventListener('click', () => {
    formCard.style.display = 'none';
});

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
            cantidad: Number(cantidadEl.value)
        });
        formCard.style.display = 'none';
        await cargarCompras();
        showToast('Erosketa ongi erregistratu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

(async function start() {
    const user = await initSesion();
    if (!user) return;
    try {
        await cargarEquiposSelect();
        await cargarCompras();
    } catch (err) {
        showToast(err.message, 'error');
    }
})();