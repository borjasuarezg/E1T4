/**
 * Validación en el LADO CLIENTE.
 * Importante: esta validación solo mejora la experiencia de uso.
 * El servidor (PHP) SIEMPRE repite estas comprobaciones, porque
 * el cliente puede manipularse o saltarse por completo (requisito
 * del reto: "baliozkotze bikotza" - doble validación).
 */

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Marca un campo como inválido/válido y muestra su mensaje de error. */
function setFieldState(fieldEl, isValid) {
    fieldEl.classList.toggle('invalid', !isValid);
    return isValid;
}

/** Valida que un input de texto no esté vacío (tras recortar espacios). */
function validateRequired(inputEl) {
    const fieldEl = inputEl.closest('.field');
    return setFieldState(fieldEl, inputEl.value.trim().length > 0);
}

function validateEmail(inputEl) {
    const fieldEl = inputEl.closest('.field');
    return setFieldState(fieldEl, RE_EMAIL.test(inputEl.value.trim()));
}

function validateMinLength(inputEl, min) {
    const fieldEl = inputEl.closest('.field');
    return setFieldState(fieldEl, inputEl.value.length >= min);
}

function validatePositiveNumber(inputEl) {
    const fieldEl = inputEl.closest('.field');
    const n = Number(inputEl.value);
    return setFieldState(fieldEl, inputEl.value !== '' && !Number.isNaN(n) && n >= 0);
}

function validateSelect(selectEl) {
    const fieldEl = selectEl.closest('.field');
    return setFieldState(fieldEl, !!selectEl.value);
}
