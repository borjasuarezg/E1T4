const tbody = document.getElementById('tbodyGelas');
const formCard = document.getElementById('formGela');

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

async function cargarGelas() {
    const gelas = await api.get('/gelas');
    tbody.innerHTML = gelas.length ? gelas.map(g => `
        <tr data-id="${g.id}">
            <td>${escapeHtml(g.nombre)}</td>
            <td><span class="badge">${g.tipo}</span></td>
            <td>${escapeHtml(g.ubicacion_fisica || '—')}</td>
            <td style="text-align:right"><button class="btn btn-danger" data-action="ezabatu">Ezabatu</button></td>
        </tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-mute)">Ez dago gelarik.</td></tr>`;
}

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action="ezabatu"]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (!confirm('Ziur zaude gela hau ezabatu nahi duzula?')) return;
    try { await api.delete(`/gelas/${id}`); await cargarGelas(); }
    catch (err) { alert(err.message); }
});

document.getElementById('btnNuevaGela').addEventListener('click', () => {
    document.getElementById('gelaForm').reset();
    formCard.style.display = 'block';
});
document.getElementById('btnCancelarGela').addEventListener('click', () => formCard.style.display = 'none');

document.getElementById('gelaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombreEl = document.getElementById('nombre');
    if (!validateRequired(nombreEl)) return;
    try {
        await api.post('/gelas', {
            nombre: nombreEl.value.trim(),
            tipo: document.getElementById('tipo').value,
            ubicacion_fisica: document.getElementById('ubicacion_fisica').value.trim(),
        });
        formCard.style.display = 'none';
        await cargarGelas();
    } catch (err) { alert(err.message); }
});

(async function start() {
    await initSesion();
    await cargarGelas();
})();
