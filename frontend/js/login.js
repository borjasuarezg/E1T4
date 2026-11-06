/**
 * Módulo: login.js
 * Página de login de la web cliente.
 * Usa funciones globales de base.js: initSesion, validate*, showToast, API_BASE
 */

const form = document.getElementById('loginForm');
const errorBox = document.getElementById('loginError');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const username = document.getElementById('username');
    const password = document.getElementById('password');

    if (!validateRequired(username) || !validateMinLength(password, 8)) return;

    try {
        const baseUrl = window.API_BASE || (typeof API_BASE !== 'undefined' ? API_BASE : `${window.location.protocol}//server.talde4.edu/api`);
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.value.trim(),
                password: password.value
            }),
            credentials: 'include'
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            errorBox.textContent = data.error || data.errores?.join(', ') || 'Errorea';
            errorBox.style.display = 'block';
            return;
        }

        window.location.href = 'index.html';
    } catch (err) {
        errorBox.textContent = err.message;
        errorBox.style.display = 'block';
    }
});
