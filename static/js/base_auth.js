// GSLEARNING - static/js/base_auth.js
// JavaScript específico para páginas de autenticação

/**
 * ===== INICIALIZAÇÃO PARA PÁGINAS DE AUTH =====
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 GSLearning Auth - Sistema de autenticação inicializado');
    
    // Inicializar recursos específicos de autenticação
    initializeAuthFeatures();
    initializeAuthAnimations();
    initializeAuthValidation();
    initializeAuthSecurity();
    initializeAuthAccessibility();
    
    // Recursos globais específicos para auth
    setupAuthKeyboardShortcuts();
    enableAuthTooltips();
    
    console.log('✅ Autenticação configurada com sucesso');
});

/**
 * ===== RECURSOS DE AUTENTICAÇÃO =====
 */
function initializeAuthFeatures() {
    // Auto-focus no primeiro campo
    autoFocusFirstField();
    
    // Password toggle (mostrar/esconder senha)
    initializePasswordToggle();
    
    // Remember me functionality
    initializeRememberMe();
    
    // Form submission com loading
    initializeAuthFormSubmission();
    
    // Caps Lock detection
    initializeCapsLockDetection();
    
    // Auto-complete enhancements
    enhanceAutoComplete();
}

function autoFocusFirstField() {
    const firstInput = document.querySelector('input[type="text"], input[type="email"], input[type="username"]');
    if (firstInput && !window.matchMedia('(max-width: 768px)').matches) {
        // Não fazer auto-focus em mobile para evitar zoom indesejado
        setTimeout(() => {
            firstInput.focus();
        }, 300);
    }
}

function initializePasswordToggle() {
    const passwordToggles = document.querySelectorAll('[data-password-toggle]');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            togglePasswordVisibility(this);
        });
    });
    
    // Também permitir toggle via teclado
    const passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => {
        field.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Shift + V para toggle
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                const toggle = field.parentElement.querySelector('[data-password-toggle]');
                if (toggle) {
                    togglePasswordVisibility(toggle);
                }
            }
        });
    });
}

function togglePasswordVisibility(toggleButton) {
    const passwordField = toggleButton.closest('.auth-input-container, .login-field-container')
                                    ?.querySelector('input[type="password"], input[type="text"]');
    
    if (!passwordField) return;
    
    const icon = toggleButton.querySelector('i');
    const isPassword = passwordField.type === 'password';
    
    // Toggle type
    passwordField.type = isPassword ? 'text' : 'password';
    
    // Toggle icon
    if (icon) {
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
    
    // Update ARIA label
    toggleButton.setAttribute('aria-label', 
        isPassword ? 'Esconder senha' : 'Mostrar senha'
    );
    
    // Animação sutil
    toggleButton.style.transform = 'scale(0.9)';
    setTimeout(() => {
        toggleButton.style.transform = 'scale(1)';
    }, 100);
    
    // Manter foco no campo
    passwordField.focus();
}

function initializeRememberMe() {
    const rememberCheckbox = document.querySelector('input[name="remember-me"], input[name="remember_me"]');
    
    if (rememberCheckbox) {
        // Carregar estado salvo
        const savedState = localStorage.getItem('auth_remember_preference');
        if (savedState === 'true') {
            rememberCheckbox.checked = true;
        }
        
        // Salvar mudanças
        rememberCheckbox.addEventListener('change', function() {
            localStorage.setItem('auth_remember_preference', this.checked);
        });
    }
}

function initializeAuthFormSubmission() {
    const authForms = document.querySelectorAll('form[data-auth-form]');
    
    authForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
            
            if (submitBtn) {
                // Validação antes do envio
                if (!validateAuthForm(this)) {
                    e.preventDefault();
                    return false;
                }
                
                // Loading state
                setAuthLoadingState(submitBtn, true);
                
                // Timeout de segurança
                setTimeout(() => {
                    setAuthLoadingState(submitBtn, false);
                }, 10000);
            }
        });
    });
}

function validateAuthForm(form) {
    const requiredFields = form.querySelectorAll('input[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showAuthFieldError(field, 'Este campo é obrigatório');
            isValid = false;
        } else {
            clearAuthFieldError(field);
        }
    });
    
    // Validação específica de email
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value && !isValidEmail(emailField.value)) {
        showAuthFieldError(emailField, 'Digite um email válido');
        isValid = false;
    }
    
    // Validação de senha mínima
    const passwordField = form.querySelector('input[type="password"]');
    if (passwordField && passwordField.value && passwordField.value.length < 6) {
        showAuthFieldError(passwordField, 'A senha deve ter pelo menos 6 caracteres');
        isValid = false;
    }
    
    return isValid;
}

function setAuthLoadingState(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        
        // Ícone + texto
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-spinner fa-spin';
        }
        
        const textSpan = button.querySelector('.btn-text') || button;
        textSpan.textContent = 'Entrando...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        
        if (button.dataset.originalText) {
            const textSpan = button.querySelector('.btn-text') || button;
            textSpan.textContent = button.dataset.originalText;
        }
        
        const icon = button.querySelector('i');
        if (icon && !icon.classList.contains('fa-spin')) {
            icon.className = 'fas fa-sign-in-alt';
        }
    }
}

/**
 * ===== ANIMAÇÕES DE AUTENTICAÇÃO =====
 */
function initializeAuthAnimations() {
    // Animação de entrada dos elementos
    animateAuthElements();
    
    // Animações de interação nos campos
    setupFieldAnimations();
    
    // Floating labels
    initializeFloatingLabels();
    
    // Shake animation para erros
    setupErrorAnimations();
}

function animateAuthElements() {
    const elements = document.querySelectorAll('.auth-form-card, .login-card');
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
}

function setupFieldAnimations() {
    const inputs = document.querySelectorAll('.auth-input, .login-field-input');
    
    inputs.forEach(input => {
        // Animação de foco
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
            animateFieldFocus(this);
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (!this.value) {
                this.parentElement.classList.remove('has-value');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value) {
                this.parentElement.classList.add('has-value');
            } else {
                this.parentElement.classList.remove('has-value');
            }
        });
        
        // Estado inicial
        if (input.value) {
            input.parentElement.classList.add('has-value');
        }
    });
}

function animateFieldFocus(field) {
    // Ripple effect sutil
    const ripple = document.createElement('div');
    ripple.className = 'field-ripple';
    
    const fieldContainer = field.parentElement;
    fieldContainer.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function initializeFloatingLabels() {
    const floatingLabelFields = document.querySelectorAll('[data-floating-label]');
    
    floatingLabelFields.forEach(field => {
        const label = field.querySelector('label');
        const input = field.querySelector('input');
        
        if (label && input) {
            // Converter para floating label
            label.classList.add('floating-label');
            
            function updateLabelState() {
                if (input.value || input === document.activeElement) {
                    label.classList.add('floating');
                } else {
                    label.classList.remove('floating');
                }
            }
            
            input.addEventListener('focus', updateLabelState);
            input.addEventListener('blur', updateLabelState);
            input.addEventListener('input', updateLabelState);
            
            // Estado inicial
            updateLabelState();
        }
    });
}

function setupErrorAnimations() {
    // Observer para detectar novos erros
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.classList && node.classList.contains('auth-error-message')) {
                    shakeElement(node.parentElement);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

/**
 * ===== VALIDAÇÃO DE AUTENTICAÇÃO =====
 */
function initializeAuthValidation() {
    const authInputs = document.querySelectorAll('.auth-input, .login-field-input');
    
    authInputs.forEach(input => {
        // Validação em tempo real
        input.addEventListener('input', debounce(function() {
            validateAuthField(this);
        }, 300));
        
        input.addEventListener('blur', function() {
            validateAuthField(this);
        });
        
        // Limpar erro ao digitar
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                clearAuthFieldError(this);
            }
        });
    });
}

function validateAuthField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    
    // Limpar estado anterior
    clearAuthFieldError(field);
    
    // Campo obrigatório
    if (field.hasAttribute('required') && !value) {
        return true; // Não mostrar erro até blur ou submit
    }
    
    // Validações específicas
    if (value) {
        // Email
        if (type === 'email' || name === 'email') {
            if (!isValidEmail(value)) {
                showAuthFieldError(field, 'Digite um email válido');
                return false;
            }
        }
        
        // Username
        if (name === 'username') {
            if (value.length < 3) {
                showAuthFieldError(field, 'Nome de usuário deve ter pelo menos 3 caracteres');
                return false;
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                showAuthFieldError(field, 'Use apenas letras, números, _ e -');
                return false;
            }
        }
        
        // Password
        if (type === 'password') {
            const strength = getPasswordStrength(value);
            updatePasswordStrength(field, strength);
            
            if (value.length < 6) {
                showAuthFieldError(field, 'A senha deve ter pelo menos 6 caracteres');
                return false;
            }
        }
    }
    
    // Campo válido
    field.classList.add('valid');
    return true;
}

function showAuthFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('valid');
    
    // Remover erro anterior
    const existingError = field.parentElement.querySelector('.auth-error-message, .login-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Adicionar novo erro
    const errorElement = document.createElement('div');
    errorElement.className = 'auth-error-message login-error-message';
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle auth-alert-icon"></i>
        <span class="auth-alert-text">${message}</span>
    `;
    
    field.parentElement.appendChild(errorElement);
    
    // Animação de entrada
    errorElement.style.opacity = '0';
    errorElement.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        errorElement.style.transition = 'all 0.3s ease-out';
        errorElement.style.opacity = '1';
        errorElement.style.transform = 'translateY(0)';
    }, 10);
}

function clearAuthFieldError(field) {
    field.classList.remove('error');
    
    const errorElement = field.parentElement.querySelector('.auth-error-message, .login-error-message');
    if (errorElement) {
        errorElement.style.opacity = '0';
        setTimeout(() => {
            errorElement.remove();
        }, 200);
    }
}

function getPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return Math.min(strength, 4);
}

function updatePasswordStrength(field, strength) {
    let strengthIndicator = field.parentElement.querySelector('.password-strength');
    
    if (!strengthIndicator) {
        strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        strengthIndicator.innerHTML = `
            <div class="strength-bars">
                <div class="strength-bar"></div>
                <div class="strength-bar"></div>
                <div class="strength-bar"></div>
                <div class="strength-bar"></div>
            </div>
            <span class="strength-text">Força da senha</span>
        `;
        field.parentElement.appendChild(strengthIndicator);
    }
    
    const bars = strengthIndicator.querySelectorAll('.strength-bar');
    const text = strengthIndicator.querySelector('.strength-text');
    
    // Reset bars
    bars.forEach(bar => {
        bar.className = 'strength-bar';
    });
    
    // Update based on strength
    const strengthLevels = ['Muito fraca', 'Fraca', 'Regular', 'Boa', 'Forte'];
    const strengthColors = ['weak', 'weak', 'medium', 'good', 'strong'];
    
    for (let i = 0; i < strength; i++) {
        bars[i].classList.add(strengthColors[strength - 1]);
    }
    
    text.textContent = strengthLevels[strength] || 'Muito fraca';
}

/**
 * ===== SEGURANÇA =====
 */
function initializeAuthSecurity() {
    // Rate limiting local
    setupLoginAttemptTracking();
    
    // Detectar múltiplas abas
    detectMultipleTabs();
    
    // Timeout de sessão
    setupSessionTimeout();
    
    // Detectar dispositivo suspeito
    checkDeviceFingerprint();
}

function setupLoginAttemptTracking() {
    const maxAttempts = 5;
    const cooldownTime = 15 * 60 * 1000; // 15 minutos
    
    function getAttempts() {
        const data = localStorage.getItem('auth_attempts');
        return data ? JSON.parse(data) : { count: 0, timestamp: 0 };
    }
    
    function setAttempts(count, timestamp) {
        localStorage.setItem('auth_attempts', JSON.stringify({ count, timestamp }));
    }
    
    function isBlocked() {
        const attempts = getAttempts();
        if (attempts.count >= maxAttempts) {
            const timeRemaining = cooldownTime - (Date.now() - attempts.timestamp);
            return timeRemaining > 0 ? timeRemaining : false;
        }
        return false;
    }
    
    // Verificar bloqueio ao carregar
    const blocked = isBlocked();
    if (blocked) {
        showCooldownMessage(Math.ceil(blocked / 60000));
    }
    
    // Tracking de tentativas
    const loginForm = document.querySelector('form[data-auth-form]');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            if (isBlocked()) {
                e.preventDefault();
                showCooldownMessage(Math.ceil(isBlocked() / 60000));
                return;
            }
            
            // Increment attempts on failed login (seria tratado pelo backend)
            // Este é apenas um exemplo de implementação client-side
        });
    }
    
    window.authTracker = {
        recordFailedAttempt() {
            const attempts = getAttempts();
            setAttempts(attempts.count + 1, Date.now());
        },
        
        resetAttempts() {
            localStorage.removeItem('auth_attempts');
        }
    };
}

function showCooldownMessage(minutes) {
    showAuthAlert(
        `Muitas tentativas de login. Tente novamente em ${minutes} minuto(s).`,
        'warning',
        0 // Não esconder automaticamente
    );
}

function detectMultipleTabs() {
    const tabId = 'auth_tab_' + Date.now() + '_' + Math.random();
    sessionStorage.setItem('auth_tab_id', tabId);
    
    window.addEventListener('storage', function(e) {
        if (e.key === 'auth_tab_check') {
            localStorage.setItem('auth_tab_response', tabId);
        }
        
        if (e.key === 'auth_tab_response') {
            if (e.newValue !== tabId) {
                showAuthAlert(
                    'Detectada outra aba de login aberta. Por segurança, use apenas uma aba.',
                    'warning'
                );
            }
        }
    });
    
    localStorage.setItem('auth_tab_check', Date.now());
}

function setupSessionTimeout() {
    // Apenas para páginas de auth - timeout de inatividade
    let timeoutId;
    const timeoutDuration = 30 * 60 * 1000; // 30 minutos
    
    function resetTimeout() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            showAuthAlert(
                'Sessão expirada por inatividade. A página será recarregada.',
                'info'
            );
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }, timeoutDuration);
    }
    
    // Reset timeout em atividade
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimeout, true);
    });
    
    resetTimeout();
}

function checkDeviceFingerprint() {
    // Básico device fingerprinting para detectar mudanças suspeitas
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset()
    ].join('|');
    
    const stored = localStorage.getItem('device_fingerprint');
    if (stored && stored !== fingerprint) {
        showAuthAlert(
            'Detectada mudança no dispositivo. Verifique se você está no dispositivo correto.',
            'warning'
        );
    }
    
    localStorage.setItem('device_fingerprint', fingerprint);
}

/**
 * ===== ACESSIBILIDADE =====
 */
function initializeAuthAccessibility() {
    // Melhorar navegação por teclado
    enhanceKeyboardNavigation();
    
    // ARIA labels dinâmicos
    setupDynamicAriaLabels();
    
    // Anúncios para screen readers
    setupScreenReaderAnnouncements();
    
    // High contrast support
    detectHighContrast();
}

function enhanceKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
        'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach((element, index) => {
        element.addEventListener('keydown', function(e) {
            // Enter no último campo vai para submit
            if (e.key === 'Enter' && index === focusableElements.length - 2) {
                const submitBtn = document.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.focus();
                }
            }
        });
    });
}

function setupDynamicAriaLabels() {
    const passwordToggles = document.querySelectorAll('[data-password-toggle]');
    passwordToggles.forEach(toggle => {
        toggle.setAttribute('aria-label', 'Mostrar senha');
        toggle.setAttribute('role', 'button');
    });
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.hasAttribute('required')) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                label.setAttribute('aria-required', 'true');
            }
        }
    });
}

function setupScreenReaderAnnouncements() {
    // Criar região para anúncios
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.id = 'auth-announcer';
    document.body.appendChild(announcer);
    
    window.announceToScreenReader = function(message) {
        announcer.textContent = message;
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    };
}

function detectHighContrast() {
    // Detectar preferência de alto contraste
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
    }
}

/**
 * ===== FUNCIONALIDADES AUXILIARES =====
 */
function setupAuthKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter para submit rápido
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
        }
        
        // F1 para ajuda
        if (e.key === 'F1') {
            e.preventDefault();
            showAuthHelp();
        }
    });
}

function enableAuthTooltips() {
    const tooltipElements = document.querySelectorAll('[data-auth-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            showAuthTooltip(this, this.dataset.authTooltip);
        });
        
        element.addEventListener('mouseleave', hideAuthTooltip);
        element.addEventListener('focus', function() {
            showAuthTooltip(this, this.dataset.authTooltip);
        });
        
        element.addEventListener('blur', hideAuthTooltip);
    });
}

function showAuthTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'auth-tooltip';
    tooltip.textContent = text;
    tooltip.id = 'auth-tooltip';
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
    tooltip.style.left = (rect.left + (rect.width - tooltip.offsetWidth) / 2) + 'px';
    
    setTimeout(() => {
        tooltip.classList.add('show');
    }, 10);
}

function hideAuthTooltip() {
    const tooltip = document.getElementById('auth-tooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => {
            tooltip.remove();
        }, 200);
    }
}

function showAuthAlert(message, type = 'info', duration = 5000) {
    const alert = document.createElement('div');
    alert.className = `auth-alert auth-alert-${type}`;
    alert.innerHTML = `
        <div class="auth-alert-content">
            <i class="fas fa-${getAlertIcon(type)} auth-alert-icon"></i>
            <span class="auth-alert-text">${message}</span>
            <button class="auth-alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('show');
    }, 10);
    
    if (duration > 0) {
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                if (alert.parentElement) {
                    alert.remove();
                }
            }, 300);
        }, duration);
    }
    
    // Anunciar para screen readers
    if (window.announceToScreenReader) {
        window.announceToScreenReader(message);
    }
}

function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function showAuthHelp() {
    showAuthAlert(
        'Use Tab para navegar, Enter para confirmar, Ctrl+Shift+V para mostrar/esconder senha.',
        'info',
        8000
    );
}

function enhanceAutoComplete() {
    // Melhorar autocomplete para campos de login
    const usernameField = document.querySelector('input[name="username"], input[type="email"]');
    const passwordField = document.querySelector('input[type="password"]');
    
    if (usernameField) {
        usernameField.setAttribute('autocomplete', 'username');
    }
    
    if (passwordField) {
        passwordField.setAttribute('autocomplete', 'current-password');
    }
}

/**
 * ===== UTILITIES =====
 */
function initializeCapsLockDetection() {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    
    passwordFields.forEach(field => {
        field.addEventListener('keydown', function(e) {
            if (e.getModifierState && e.getModifierState('CapsLock')) {
                showCapsLockWarning(this);
            } else {
                hideCapsLockWarning(this);
            }
        });
    });
}

function showCapsLockWarning(field) {
    let warning = field.parentElement.querySelector('.caps-lock-warning');
    
    if (!warning) {
        warning = document.createElement('div');
        warning.className = 'caps-lock-warning';
        warning.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Caps Lock está ativo';
        field.parentElement.appendChild(warning);
    }
}

function hideCapsLockWarning(field) {
    const warning = field.parentElement.querySelector('.caps-lock-warning');
    if (warning) {
        warning.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * ===== API PÚBLICA PARA AUTENTICAÇÃO =====
 */
window.GSLearningAuth = {
    // Password
    togglePasswordVisibility,
    
    // Validation
    validateAuthField,
    validateAuthForm,
    showAuthFieldError,
    clearAuthFieldError,
    
    // Loading
    setAuthLoadingState,
    
    // Alerts
    showAuthAlert,
    
    // Security
    authTracker: window.authTracker,
    
    // Utilities
    isValidEmail,
    debounce
};

console.log('✅ GSLearning base_auth.js carregado com sucesso!');