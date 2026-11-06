/**
 * Funciones compartidas para todas las páginas web cliente.
 * Centraliza initSesion, escapeHtml, logout y configuración API.
 * Este archivo debe incluirse PRIMERO en cada HTML antes que los módulos específicos.
 * 
 * Uso: <script src="js/base.js"></script> (sin type="module")
 * 
 * Funciones globales disponibles:
 * - API_BASE: URL base de la API
 * - initSesion(): Inicializa sesión de usuario
 * - escapeHtml(str): Prevención XSS
 * - logout(): Cierra sesión
 * - validateRequired(input): Validación campo requerido
 * - validateMinLength(input, min): Validación longitud mínima
 * - validateSelect(select): Validación select
 * - showToast(message, type): Notificación toast
 * - setFieldState(field, isValid): Estado campo
 * - csrfToken: Token CSRF actual
 */

(function() {
    // Configuración de API_BASE: priority order
    // 1. ?api_base= URL parameter
    // 2. window.API_BASE global (for build/configuration)
    // 3. Default to server.talde4.edu
    
    const protocol = window.location.protocol || 'http:';
    let baseUrl = '';
    
    // Check URL parameter first
    const search = window.location.search || '';
    const paramMatch = search.match(/[?&]api_base=([^&]+)/);
    if (paramMatch) {
        baseUrl = paramMatch[1];
    } else if (window.API_BASE && typeof window.API_BASE === 'string') {
        // Fallback to global window.API_BASE if set (e.g., by build process)
        baseUrl = window.API_BASE;
    }
    
    // Construct full API base
    let host = baseUrl;
    if (host && !host.includes('://')) {
        host = protocol + '//' + host;
    }
    // Ensure it ends with /api
    if (host && !host.endsWith('/api') && !host.endsWith('.php')) {
        host = host.replace(protocol + '//', protocol + '//api.');
    }
    
    // Global config
    window.API_BASE = (host || protocol + '//server.talde4.edu/api');
    window.__API_CONFIG = {
        base: window.API_BASE
    };
    
    // Export functions as globals (for non-module scripts)
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
            const navUsuarios = document.getElementById('navUsuarios');
            
            if (userNameEl) userNameEl.textContent = data.user.username;
            if (userRoleEl) userRoleEl.textContent = data.user.rol;
            if (navUsuarios) navUsuarios.hidden = data.user.rol !== 'admin';
            
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
            // Ignorar errores en logout
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