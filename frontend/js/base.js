/**
 * Funtzio partekatuak bezeroaren orri guztietarako.
 * initSesion, escapeHtml, logout eta API konfigurazioa zentralizatzen ditu.
 * Fitxategi hau LEHENENGO sartu behar da HTML bakoitzean, modulu espezifikoen aurretik.
 *
 * Erabilera: <script src="js/base.js"></script> (ez type="module")
 *
 * Funtzio global eskuragarriak:
 * - API_BASE: APIren oinarrizko URLa
 * - initSesion(): Erabiltzailearen saioa hasi
 * - escapeHtml(str): XSS prebentzioa
 * - logout(): Saioa itxi
 * - validateRequired(input): Eremu beharrezkoaren baliozkotzea
 * - validateMinLength(input, min): Gutxieneko luzeraren baliozkotzea
 * - validateSelect(select): Aukera-zerrendaren baliozkotzea
 * - showToast(message, type): Toast jakinarazpena
 * - setFieldState(field, isValid): Eremuaren egoera
 * - csrfToken: Uneko CSRF tokena
 */

(function() {
    // API_BASE konfigurazioa: lehentasun-ordena
    // 1. ?api_base= URL parametroa
    // 2. window.API_BASE globala (eraikuntza/konfiguraziorako)
    // 3. Lehenetsia: server.talde4.edu

    const protocol = window.location.protocol || 'http:';
    let baseUrl = '';

    // Egiaztatu lehenik URL parametroa
    const search = window.location.search || '';
    const paramMatch = search.match(/[?&]api_base=([^&]+)/);
    if (paramMatch) {
        baseUrl = paramMatch[1];
    } else if (window.API_BASE && typeof window.API_BASE === 'string') {
        // Ordezkoa: window.API_BASE globala ezarrita badago (adibidez, eraikuntza-prozesuak)
        baseUrl = window.API_BASE;
    }

    // Eraiki API oinarri osoa
    let host = baseUrl;
    if (host && !host.includes('://')) {
        host = protocol + '//' + host;
    }
    // Ziurtatu /api-rekin amaitzen dela
    if (host && !host.endsWith('/api') && !host.endsWith('.php')) {
        host = host.replace(protocol + '//', protocol + '//api.');
    }

    // Konfigurazio globala
    window.API_BASE = (host || protocol + '//server.talde4.edu/api');
    window.__API_CONFIG = {
        base: window.API_BASE
    };

    // Esportatu funtzioak global gisa (modulu gabeko scriptetarako)
    // initSesion
    window.initSesion = async function() {
        try {
            const res = await fetch(`${window.API_BASE}/auth/me`, {
                credentials: 'include'
            });
            const data = await res.json().catch(() => ({}));

            if (!data || !data.user) {
                window.location.href = 'login.html';
                return;
            }

            const userNameEl = document.getElementById('userName');
            const userRoleEl = document.getElementById('userRole');
            const navErabiltzaileak = document.getElementById('navErabiltzaileak');

            if (userNameEl) userNameEl.textContent = data.user.username;
            if (userRoleEl) userRoleEl.textContent = data.user.rol;
            if (navErabiltzaileak) navErabiltzaileak.hidden = data.user.rol !== 'admin';

            csrfToken = data.csrf_token || '';
            return data.user;
        } catch {
            window.location.href = 'login.html';
        }
    };

    // escapeHtml
    window.escapeHtml = function(str) {
        if (typeof str !== 'string') return String(str ?? '');
        return str.replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));
    };

    // logout
    window.logout = async function() {
        try {
            await fetch(`${window.API_BASE}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            }).catch(() => {});
        } catch {
            // Ezikusi saioa ixtean sortutako erroreak
        }
        window.location.href = 'login.html';
    };

    // validateRequired
    window.validateRequired = function(inputEl) {
        const fieldEl = inputEl.closest('.field');
        const ok = inputEl.value.trim().length > 0;
        if (fieldEl) {
            fieldEl.classList.toggle('invalid', !ok);
        }
        return ok;
    };

    // validateMinLength
    window.validateMinLength = function(inputEl, min = 8) {
        const fieldEl = inputEl.closest('.field');
        const ok = inputEl.value.length >= min;
        if (fieldEl) {
            fieldEl.classList.toggle('invalid', !ok);
        }
        return ok;
    };

    // validateSelect
    window.validateSelect = function(selectEl) {
        const fieldEl = selectEl.closest('.field');
        const ok = !!selectEl.value;
        if (fieldEl) {
            fieldEl.classList.toggle('invalid', !ok);
        }
        return ok;
    };

    // showToast
    window.showToast = function(message, type = 'info', duration = 3000) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 200ms ease';
            setTimeout(() => toast.remove(), 200);
        }, duration);
    };

    // setFieldState
    window.setFieldState = function(fieldEl, isValid) {
        if (fieldEl) fieldEl.classList.toggle('invalid', !isValid);
        return isValid;
    };

})();
