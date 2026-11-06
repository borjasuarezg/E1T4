/**
 * Validación en el LADO CLIENTE.
 * Funciones globales disponibles (compatibles con scripts tradicionales):
 * - validateRequired(input)
 * - validateMinLength(input, min)
 * - validateSelect(select)
 * - setFieldState(field, isValid)
 * 
 * El servidor (PHP) SIEMPRE repite estas comprobaciones ("baliozkotze bikotza").
 */

function validateRequired(inputEl) {
    if (window.validateRequired && window.validateRequired !== validateRequired) {
        return window.validateRequired(inputEl);
    }
    const fieldEl = inputEl.closest('.field');
    const ok = inputEl.value.trim().length > 0;
    if (fieldEl) fieldEl.classList.toggle('invalid', !ok);
    return ok;
}

function validateMinLength(inputEl, min = 8) {
    if (window.validateMinLength && window.validateMinLength !== validateMinLength) {
        return window.validateMinLength(inputEl, min);
    }
    const fieldEl = inputEl.closest('.field');
    const ok = inputEl.value.length >= min;
    if (fieldEl) fieldEl.classList.toggle('invalid', !ok);
    return ok;
}

function validateSelect(selectEl) {
    if (window.validateSelect && window.validateSelect !== validateSelect) {
        return window.validateSelect(selectEl);
    }
    const fieldEl = selectEl.closest('.field');
    const ok = selectEl.value !== '';
    if (fieldEl) fieldEl.classList.toggle('invalid', !ok);
    return ok;
}

function setFieldState(fieldEl, isValid) {
    if (window.setFieldState && window.setFieldState !== setFieldState) {
        return window.setFieldState(fieldEl, isValid);
    }
    if (fieldEl) fieldEl.classList.toggle('invalid', !isValid);
    return isValid;
}

window.validateRequired = validateRequired;
window.validateMinLength = validateMinLength;
window.validateSelect = validateSelect;
window.setFieldState = setFieldState;
