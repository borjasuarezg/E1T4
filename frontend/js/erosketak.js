const zerrendaIkuspegia = document.getElementById('zerrendaIkuspegia');
const inprimakiIkuspegia = document.getElementById('inprimakiIkuspegia');
const tbody = document.getElementById('tbodyErosketak');
const erosketaForm = document.getElementById('erosketaForm');
const baliabideSelect = document.getElementById('baliabideId');
const btnGorde = document.getElementById('btnGorde');

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

/* ---------- Ikuspegia aldatu (Zerrenda <-> Inprimakia) ---------- */
async function irekiInprimakia() {
    zerrendaIkuspegia.hidden = true;
    inprimakiIkuspegia.hidden = false;
    erosketaForm.reset();
    erosketaForm.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    try {
        await kargatuEkipamenduakSelect();
    } catch (err) {
        if (typeof showToast === 'function') showToast(err.message, 'error');
    }
}

function itxiInprimakia() {
    inprimakiIkuspegia.hidden = true;
    zerrendaIkuspegia.hidden = false;
}

document.getElementById('btnErosketaBerria').addEventListener('click', irekiInprimakia);
document.getElementById('btnUtzi').addEventListener('click', itxiInprimakia);

/* ---------- Saioa ---------- */
async function initSesion() {
    const { user } = await api.get('/auth/me');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userRole').textContent = user.rol;
    if (user.rol === 'admin') {
        document.getElementById('navErabiltzaileak').hidden = false;
    }
}

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
    window.location.href = 'login.html';
});

/* ---------- Zerrenda eta aukera-zerrenda ---------- */
async function kargatuErosketak() {
    const erosketak = await api.get('/erosketak');
    tbody.innerHTML = erosketak.length ? erosketak.map(e => `
        <tr>
            <td>${escapeHtml(e.baliabide_izena)}</td>
            <td>${escapeHtml(e.erosketaData)}</td>
            <td><span class="badge">${e.kopurua} unitez</span></td>
        </tr>`).join('') : `<tr><td colspan="3" style="color:var(--text-mute)">Ez dago erosketarik.</td></tr>`;
}

async function kargatuEkipamenduakSelect() {
    const ekipamenduak = await api.get('/ekipamenduak');
    baliabideSelect.innerHTML = '<option value="">Aukeratu…</option>' +
        ekipamenduak.map(e => `<option value="${e.id}">${escapeHtml(e.izena)}</option>`).join('');
}

/* ---------- Inprimakia bidaltzea ---------- */
erosketaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dataEl = document.getElementById('erosketaData');
    const kopuruaEl = document.getElementById('kopurua');

    const okEkipamendua = validateSelect(baliabideSelect);
    const okData = validateRequired(dataEl);
    const okKopurua = setFieldState(kopuruaEl.closest('.field'), Number(kopuruaEl.value) >= 1);
    if (!(okEkipamendua && okData && okKopurua)) return;

    btnGorde.disabled = true;
    try {
        await api.post('/erosketak', {
            baliabideId: Number(baliabideSelect.value),
            erosketaData: dataEl.value,
            kopurua: Number(kopuruaEl.value)
        });
        itxiInprimakia();
        await kargatuErosketak();
        if (typeof showToast === 'function') showToast('Erosketa ongi erregistratu da', 'success');
    } catch (err) {
        if (typeof showToast === 'function') showToast(err.message, 'error');
    } finally {
        btnGorde.disabled = false;
    }
});

(async function start() {
    await initSesion();
    await kargatuErosketak();
})();
