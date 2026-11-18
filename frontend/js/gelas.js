const tbody = document.getElementById('tbodyGelas');
const formCard = document.getElementById('formGela');

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
});

async function cargarGelas() {
    const gelas = await api.get('/gelas');
    tbody.innerHTML = gelas.length ? gelas.map(g => `
        <tr data-id="${g.id}">
            <td>${escapeHtml(g.nombre)}</td>
            <td>${escapeHtml(g.taldea || '—')}</td>
            <td style="text-align:right"><button type="button" class="btn btn-danger" data-action="ezabatu">Ezabatu</button></td>
        </tr>`).join('') : `<tr><td colspan="3" style="color:var(--text-mute)">Ez dago gelarik.</td></tr>`;
}

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action="ezabatu"]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (!confirm('Ziur zaude gela hau ezabatu nahi duzula?')) return;
    try {
        await api.delete(`/gelas/${id}`);
        await cargarGelas();
        showToast('Gela ongi ezabatu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

document.getElementById('btnNuevaGela').addEventListener('click', () => {
    document.getElementById('gelaForm').reset();
    formCard.style.display = 'block';
});

document.getElementById('btnCancelarGela').addEventListener('click', () => {
    formCard.style.display = 'none';
});

document.getElementById('gelaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombreEl = document.getElementById('nombre');
    if (!validateRequired(nombreEl)) return;
    try {
        await api.post('/gelas', {
            nombre: nombreEl.value.trim(),
            taldea: document.getElementById('taldea').value.trim()
        });
        formCard.style.display = 'none';
        await cargarGelas();
        showToast('Gela ongi sortu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

(async function start() {
    const user = await initSesion();
    if (!user) return;
    try {
        await cargarGelas();
    } catch (err) {
        showToast(err.message, 'error');
    }
})();