const zerrendaIkuspegia = document.getElementById('zerrendaIkuspegia');
const inprimakiIkuspegia = document.getElementById('inprimakiIkuspegia');
const tbody = document.getElementById('tbodyEkipamenduak');
const ekipamenduForm = document.getElementById('ekipamenduForm');
const formTitulua = document.getElementById('formTitulua');
const kategoriaSelect = document.getElementById('kategoriaId');

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

function irekiInprimakia(titulua = 'Ekipo berria') {
    formTitulua.textContent = titulua;
    ekipamenduForm.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    zerrendaIkuspegia.hidden = true;
    inprimakiIkuspegia.hidden = false;
}

function itxiInprimakia() {
    inprimakiIkuspegia.hidden = true;
    zerrendaIkuspegia.hidden = false;
}

async function kargatuKategoriak() {
    const kategoriak = await api.get('/kategoriak');
    kategoriaSelect.innerHTML = '<option value="">Aukeratu…</option>' +
        kategoriak.map(k => `<option value="${k.id}">${escapeHtml(k.izena)}</option>`).join('');
}

async function kargatuEkipamenduak() {
    const ekipamenduak = await api.get('/ekipamenduak');
    if (!ekipamenduak.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-mute)">Ez dago ekiporik.</td></tr>`;
        return;
    }
    tbody.innerHTML = ekipamenduak.map(eq => `
        <tr data-id="${eq.id}">
            <td>${escapeHtml(eq.izena)}</td>
            <td>${escapeHtml(eq.marka || '—')} / ${escapeHtml(eq.modeloa || '—')}</td>
            <td>${escapeHtml(eq.kategoria_izena || '—')}</td>
            <td><span class="badge">${eq.stock} unitez</span></td>
            <td style="text-align:right">
                <button class="btn btn-ghost" data-action="editatu">Editatu</button>
                <button class="btn btn-danger" data-action="ezabatu">Ezabatu</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnBerria').addEventListener('click', () => {
    ekipamenduForm.reset();
    document.getElementById('ekipamenduId').value = '';
    irekiInprimakia('Ekipo berria');
    document.getElementById('izena').focus();
});

document.getElementById('btnUtzi').addEventListener('click', itxiInprimakia);

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;

    if (btn.dataset.action === 'ezabatu') {
        if (!confirm('Ziur zaude ekipo hau ezabatu nahi duzula?')) return;
        try {
            await api.delete(`/ekipamenduak/${id}`);
            showToast('Ekipoa ezabatu da', 'success');
            await kargatuEkipamenduak();
        } catch (err) { showToast(err.message, 'error'); }
    }

    if (btn.dataset.action === 'editatu') {
        try {
            const eq = await api.get(`/ekipamenduak/${id}`);
            document.getElementById('ekipamenduId').value = eq.id || '';
            document.getElementById('izena').value = eq.izena || '';
            document.getElementById('marka').value = eq.marka || '';
            document.getElementById('modeloa').value = eq.modeloa || '';
            document.getElementById('deskribapena').value = eq.deskribapena || '';
            kategoriaSelect.value = eq.kategoriaId || '';
            irekiInprimakia('Ekipoa editatu');
        } catch (err) { showToast(err.message, 'error'); }
    }
});

ekipamenduForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const izenaEl = document.getElementById('izena');
    if (!validateRequired(izenaEl) || !validateSelect(kategoriaSelect)) return;

    const payload = {
        izena: izenaEl.value.trim(),
        marka: document.getElementById('marka').value.trim(),
        modeloa: document.getElementById('modeloa').value.trim(),
        deskribapena: document.getElementById('deskribapena').value.trim(),
        kategoriaId: Number(kategoriaSelect.value)
    };

    const id = document.getElementById('ekipamenduId').value;
    try {
        if (id) {
            await api.put(`/ekipamenduak/${id}`, payload);
            showToast('Ekipoa ongi eguneratu da', 'success');
        } else {
            await api.post('/ekipamenduak', payload);
            showToast('Ekipoa ongi sortu da', 'success');
        }
        itxiInprimakia();
        await kargatuEkipamenduak();
    } catch (err) { showToast(err.message, 'error'); }
});

(async function start() {
    await initSesion();
    await kargatuKategoriak();
    await kargatuEkipamenduak();
})();
