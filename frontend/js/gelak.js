const zerrendaIkuspegia = document.getElementById('zerrendaIkuspegia');
const inprimakiIkuspegia = document.getElementById('inprimakiIkuspegia');
const tbody = document.getElementById('tbodyGelak');
const gelaForm = document.getElementById('gelaForm');

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function initSesion() {
    const { user } = await api.get('/auth/me');
    if (!user) { window.location.href = 'login.html'; return; }
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userRole').textContent = user.rol;
    if (user.rol === 'admin') document.getElementById('navErabiltzaileak').hidden = false;
}

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
    window.location.href = 'login.html';
});

function irekiInprimakia() {
    gelaForm.reset();
    gelaForm.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    zerrendaIkuspegia.hidden = true;
    inprimakiIkuspegia.hidden = false;
    document.getElementById('izena').focus();
}

function itxiInprimakia() {
    inprimakiIkuspegia.hidden = true;
    zerrendaIkuspegia.hidden = false;
}

async function kargatuGelak() {
    const gelak = await api.get('/gelak');
    tbody.innerHTML = gelak.length ? gelak.map(g => `
        <tr data-id="${g.id}">
            <td>${escapeHtml(g.izena)}</td>
            <td>${escapeHtml(g.taldea || '—')}</td>
            <td style="text-align:right"><button class="btn btn-danger" data-action="ezabatu">Ezabatu</button></td>
        </tr>`).join('') : `<tr><td colspan="3" style="color:var(--text-mute)">Ez dago gelarik.</td></tr>`;
}

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action="ezabatu"]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (!confirm('Ziur zaude gela hau ezabatu nahi duzula?')) return;
    try {
        await api.delete(`/gelak/${id}`);
        await kargatuGelak();
        showToast('Gela ongi ezabatu da', 'success');
    } catch (err) { showToast(err.message, 'error'); }
});

document.getElementById('btnGelaBerria').addEventListener('click', irekiInprimakia);
document.getElementById('btnUtzi').addEventListener('click', itxiInprimakia);

gelaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const izenaEl = document.getElementById('izena');
    if (!validateRequired(izenaEl)) return;
    try {
        await api.post('/gelak', {
            izena: izenaEl.value.trim(),
            taldea: document.getElementById('taldea').value.trim()
        });
        itxiInprimakia();
        await kargatuGelak();
        showToast('Gela ongi sortu da', 'success');
    } catch (err) { showToast(err.message, 'error'); }
});

(async function start() {
    await initSesion();
    await kargatuGelak();
})();
