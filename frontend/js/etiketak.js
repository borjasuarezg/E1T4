const zerrendaIkuspegia = document.getElementById('zerrendaIkuspegia');
const inprimakiIkuspegia = document.getElementById('inprimakiIkuspegia');
const etiketaInprimakia = document.getElementById('formEtiketa');
const tbody = document.getElementById('tbodyEtiketak');
const etiketaForm = document.getElementById('etiketaForm');
const baliabideSelect = document.getElementById('baliabideId');
const gelaSelect = document.getElementById('gelaId');

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
});

function irekiInprimakia() {
    etiketaForm.reset();
    etiketaForm.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    if (zerrendaIkuspegia) zerrendaIkuspegia.hidden = true;
    const helmuga = inprimakiIkuspegia || etiketaInprimakia;
    if (helmuga) {
        helmuga.hidden = false;
        helmuga.style.display = 'block';
        helmuga.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.getElementById('kodea').focus({ preventScroll: true });
}

function itxiInprimakia() {
    const helmuga = inprimakiIkuspegia || etiketaInprimakia;
    if (helmuga) {
        helmuga.hidden = true;
        helmuga.style.display = 'none';
    }
    if (zerrendaIkuspegia) zerrendaIkuspegia.hidden = false;
}

async function kargatuAukerak() {
    const [ekipamenduak, gelak] = await Promise.all([api.get('/ekipamenduak'), api.get('/gelak')]);
    baliabideSelect.innerHTML = '<option value="">Aukeratu…</option>' +
        ekipamenduak.map(e => `<option value="${e.id}">${escapeHtml(e.izena)}</option>`).join('');
    gelaSelect.innerHTML = '<option value="">Aukeratu…</option>' +
        gelak.map(g => `<option value="${g.id}">${escapeHtml(g.izena)}</option>`).join('');
    return gelak;
}

async function kargatuEtiketak(gelak) {
    const etiketak = await api.get('/etiketak');
    if (!etiketak.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-mute)">Ez dago etiketarik.</td></tr>`;
        return;
    }
    tbody.innerHTML = etiketak.map(et => {
        const kodea = et.etiketa ?? '';
        const ekipamendua = et.baliabide_izena ?? '—';
        const uneGela = et.gelaId ?? '';
        const data = et.erosketaData ?? '—';
        return `
        <tr data-id="${et.id}">
            <td><strong>${escapeHtml(kodea)}</strong></td>
            <td>${escapeHtml(ekipamendua)}</td>
            <td>
                <select class="sel-gela-tabla" data-id="${et.id}">
                    <option value="">Gela gabe</option>
                    ${gelak.map(g => `<option value="${g.id}" ${g.id == uneGela ? 'selected' : ''}>${escapeHtml(g.izena)}</option>`).join('')}
                </select>
            </td>
            <td>${escapeHtml(data)}</td>
            <td style="text-align:right"><button type="button" class="btn btn-danger" data-action="baja">Ezabatu</button></td>
        </tr>`;
    }).join('');
}

tbody.addEventListener('change', async (e) => {
    if (!e.target.classList.contains('sel-gela-tabla')) return;
    const id = e.target.dataset.id;
    const gelaId = e.target.value ? Number(e.target.value) : null;
    try {
        await api.patch(`/etiketak/${id}/kokapena`, { gelaId });
        showToast('Kokapena ongi eguneratu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action="baja"]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (!confirm('Ziur zaude etiketa hau ezabatu nahi duzula?')) return;
    try {
        await api.delete(`/etiketak/${id}`);
        const gelak = await kargatuAukerak();
        await kargatuEtiketak(gelak);
        showToast('Etiketa ongi ezabatu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

document.getElementById('btnEtiketaBerria').addEventListener('click', irekiInprimakia);
document.getElementById('btnUtzi').addEventListener('click', itxiInprimakia);

etiketaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const kodeaEl = document.getElementById('kodea');
    if (!validateRequired(kodeaEl) || !validateSelect(baliabideSelect) || !validateSelect(gelaSelect)) return;

    try {
        await api.post('/etiketak', {
            etiketa: kodeaEl.value.trim(),
            baliabideId: Number(baliabideSelect.value),
            gelaId: Number(gelaSelect.value)
        });
        itxiInprimakia();
        const gelak = await kargatuAukerak();
        await kargatuEtiketak(gelak);
        showToast('Etiketa ongi sortu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

(async function start() {
    const user = await initSesion();
    if (!user) return;
    try {
        const gelak = await kargatuAukerak();
        await kargatuEtiketak(gelak);
    } catch (err) {
        showToast(err.message, 'error');
    }
})();
