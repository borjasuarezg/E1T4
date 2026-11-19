const zerrendaIkuspegia = document.getElementById('zerrendaIkuspegia');
const inprimakiIkuspegia = document.getElementById('inprimakiIkuspegia');
const erabiltzaileInprimakia = document.getElementById('formErabiltzailea');
const tbody = document.getElementById('tbodyErabiltzaileak');
const erabiltzaileForm = document.getElementById('erabiltzaileForm');

document.getElementById('logoutLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
});

function irekiInprimakia() {
    erabiltzaileForm.reset();
    erabiltzaileForm.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    if (zerrendaIkuspegia) zerrendaIkuspegia.hidden = true;
    const helmuga = inprimakiIkuspegia || erabiltzaileInprimakia;
    if (helmuga) {
        helmuga.hidden = false;
        helmuga.style.display = 'block';
        helmuga.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.getElementById('username').focus({ preventScroll: true });
}

function itxiInprimakia() {
    const helmuga = inprimakiIkuspegia || erabiltzaileInprimakia;
    if (helmuga) {
        helmuga.hidden = true;
        helmuga.style.display = 'none';
    }
    if (zerrendaIkuspegia) zerrendaIkuspegia.hidden = false;
}

async function kargatuErabiltzaileak() {
    const erabiltzaileak = await api.get('/erabiltzaileak');
    if (!erabiltzaileak.length) {
        tbody.innerHTML = `<tr><td colspan="3" style="color:var(--text-mute)">Ez dago erabiltzailerik.</td></tr>`;
        return;
    }
    tbody.innerHTML = erabiltzaileak.map(u => `
        <tr data-id="${u.id}">
            <td>${escapeHtml(u.username)}</td>
            <td><span class="badge">${escapeHtml(u.rol)}</span></td>
            <td style="text-align:right"><button type="button" class="btn btn-danger" data-action="ezabatu">Ezabatu</button></td>
        </tr>`).join('');
}

tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action="ezabatu"]');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (!confirm('Ziur zaude erabiltzaile hau ezabatu nahi duzula?')) return;
    try {
        await api.delete(`/erabiltzaileak/${id}`);
        await kargatuErabiltzaileak();
        showToast('Erabiltzailea ongi ezabatu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

document.getElementById('btnErabiltzaileBerria').addEventListener('click', irekiInprimakia);
document.getElementById('btnUtzi').addEventListener('click', itxiInprimakia);

erabiltzaileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');

    const okUser = validateRequired(usernameEl);
    const okPass = validateMinLength(passwordEl, 8);
    if (!(okUser && okPass)) return;

    try {
        await api.post('/auth/register', {
            username: usernameEl.value.trim(),
            password: passwordEl.value,
            rol: document.getElementById('rol').value
        });
        itxiInprimakia();
        await kargatuErabiltzaileak();
        showToast('Erabiltzailea ongi sortu da', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

(async function start() {
    const user = await initSesion(true);
    if (!user) return;
    try {
        await kargatuErabiltzaileak();
    } catch (err) {
        showToast(err.message, 'error');
    }
})();
