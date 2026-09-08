const form = document.getElementById('loginForm');
const errorBox = document.getElementById('loginError');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const username = document.getElementById('username');
    const password = document.getElementById('password');

    const okUser = validateRequired(username);
    const okPass = validateMinLength(password, 8);
    if (!okUser || !okPass) return;

    try {
        await api.post('/auth/login', {
            username: username.value.trim(),
            password: password.value,
        });
        window.location.href = 'index.html';
    } catch (err) {
        errorBox.textContent = err.message;
        errorBox.style.display = 'block';
    }
});
