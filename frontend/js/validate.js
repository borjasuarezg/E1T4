/**
 * Validación en el LADO CLIENTE.
 * El servidor (PHP) SIEMPRE repite estas comprobaciones ("baliozkotze bikotza").
 */
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldState(fieldEl, isValid) {
    if (fieldEl) fieldEl.classList.toggle('invalid', !isValid);
    return isValid;
}

function validateRequired(inputEl) {
    const fieldEl = inputEl.closest('.field');
    return setFieldState(fieldEl, inputEl.value.trim().length > 0);
}

function validateMinLength(inputEl, min) {
    const fieldEl = inputEl.closest('.field');
    return setFieldState(fieldEl, inputEl.value.length >= min);
}

function validateSelect(selectEl) {
    const fieldEl = selectEl.closest('.field');
    return setFieldState(fieldEl, !!selectEl.value);
}