// GSLEARNING - static/js/login.js
// JavaScript específico para a página de login

/**
 * ===== INICIALIZAÇÃO DA PÁGINA DE LOGIN =====
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔑 GSLearning Login - Página de login inicializada');
    
    // Inicializar funcionalidades específicas do login
    initializeLoginForm();
    initializeLoginValidation();
    initializeLoginSecurity();
    initializeLoginUX();
    initializeLoginAccessibility();
    
    // Features específicas
    setupPasswordToggle();
    setupRememberMe();
    setupLoginAttempts();
    
    console.log('✅ Login configurado com sucesso');
});

/**
 * ===== FORMULÁRIO DE LOGIN =====
 */
function initializeLoginForm() {
    const loginForm = document.getElementById('login-form') || document.querySelector('form[method="post"]');
    
    if (!loginForm) {
        console.warn('Formulário de login não encontrado');
        return;
    }
    
    // Auto-focus no username se não for mobile
    autoFocusUsername();
    
    // Submit com validação
    loginForm.addEventListener('submit', function(e) {
        handleLoginSubmit(e, this);
    });
    
    // Enter no campo username vai para password
    const usernameField = loginForm.querySelector('input[name="username"]');
    const passwordField = loginForm.querySelector('input[name="password"]');
    
    if (usernameField && passwordField) {
        usernameField.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                passwordField.focus();
            }
        });
    }
    
    // Enter no campo password submete o form
    if (passwordField) {
        passwordField.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                loginForm.submit();
            }
        });
    }
}

function autoFocusUsername() {
    // Só fazer auto-focus em desktop
    if (window.innerWidth > 768) {
        const usernameField = document.querySelector('#id_username, input[name="username"]');
        if (usernameField) {
            setTimeout(() => {
                usernameField.focus();
                usernameField.select(); // Selecionar texto existente
            }, 500);
        }
    }
}

function handleLoginSubmit(event, form) {
    console.log('🔄 Processando login...');
    
    // Prevenir múltiplos submits
    if (form.dataset.submitting === 'true') {
        event.preventDefault();
        return false;
    }
    
    // Validar formulário
    if (!validateLoginForm(form)) {
        event.preventDefault();
        return false;
    }
    
    // Marcar como enviando
    form.dataset.submitting = 'true';
    
    // Loading state no botão
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    setLoginLoadingState(submitBtn, true);
    
    // Desabilitar campos durante envio
    disableFormFields(form, true);
    
    // Timeout de segurança
    setTimeout(() => {
        if (form.dataset.submitting === 'true') {
            setLoginLoadingState(submitBtn, false);
            disableFormFields(form, false);
            form.dataset.submitting = 'false';
            
            showLoginError('Tempo limite excedido. Tente novamente.');
        }
    }, 15000);
    
    // Salvar tentativa de login
    recordLoginAttempt();
    
    return true;
}

function validateLoginForm(form) {
    const username = form.querySelector('input[name="username"]');
    const password = form.querySelector('input[name="password"]');
    
    let isValid = true;
    
    // Limpar erros anteriores
    clearAllLoginErrors();
    
    // Validar username
    if (!username.value.trim()) {
        showFieldError(username, 'Nome de usuário é obrigatório');
        isValid = false;
    } else if (username.value.trim().length < 3) {
        showFieldError(username, 'Nome de usuário deve ter pelo menos 3 caracteres');
        isValid = false;
    }
    
    // Validar password
    if (!password.value) {
        showFieldError(password, 'Senha é obrigatória');
        isValid = false;
    } else if (password.value.length < 6) {
        showFieldError(password, 'Senha deve ter pelo menos 6 caracteres');
        isValid = false;
    }
    
    if (!isValid) {
        // Shake animation no form
        shakeLoginForm();
        
        // Focus no primeiro campo com erro
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.focus();
        }
    }
    
    return isValid;
}

function setLoginLoadingState(button, loading) {
    if (!button) return;
    
    if (loading) {
        // Salvar estado original
        button.dataset.originalText = button.textContent;
        button.dataset.originalHtml = button.innerHTML;
        
        // Estado de loading
        button.disabled = true;
        button.classList.add('loading');
        
        // Trocar conteúdo
        button.innerHTML = `
            <i class="fas fa-spinner fa-spin login-submit-icon"></i>
            <span>Entrando...</span>
        `;
        
        // Animação adicional
        button.style.transform = 'scale(0.98)';
        
    } else {
        // Restaurar estado
        button.disabled = false;
        button.classList.remove('loading');
        
        if (button.dataset.originalHtml) {
            button.innerHTML = button.dataset.originalHtml;
        } else if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
        }
        
        button.style.transform = '';
    }
}

function disableFormFields(form, disable) {
    const fields = form.querySelectorAll('input, button, select, textarea');
    fields.forEach(field => {
        if (disable) {
            field.dataset.wasDisabled = field.disabled;
            field.disabled = true;
        } else {
            field.disabled = field.dataset.wasDisabled === 'true';
        }
    });
}

/**
 * ===== VALIDAÇÃO ESPECÍFICA DO LOGIN =====
 */
function initializeLoginValidation() {
    const loginInputs = document.querySelectorAll('#id_username, #id_password, input[name="username"], input[name="password"]');
    
    loginInputs.forEach(input => {
        // Validação em tempo real (debounced)
        input.addEventListener('input', debounce(function() {
            validateLoginField(this);
        }, 500));
        
        // Validação ao sair do campo
        input.addEventListener('blur', function() {
            validateLoginField(this);
        });
        
        // Limpar erro ao focar
        input.addEventListener('focus', function() {
            clearFieldError(this);
        });
        
        // Melhorar UX dos campos
        setupFieldEnhancements(input);
    });
}

function validateLoginField(field) {
    const value = field.value.trim();
    const name = field.name;
    
    // Não validar campos vazios em tempo real
    if (!value) {
        clearFieldError(field);
        return true;
    }
    
    let isValid = true;
    
    if (name === 'username') {
        if (value.length < 3) {
            showFieldError(field, 'Muito curto (mínimo 3 caracteres)');
            isValid = false;
        } else if (value.length > 30) {
            showFieldError(field, 'Muito longo (máximo 30 caracteres)');
            isValid = false;
        } else if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
            showFieldError(field, 'Use apenas letras, números, . _ -');
            isValid = false;
        }
    }
    
    if (name === 'password') {
        if (value.length < 6) {
            showFieldError(field, 'Muito curta (mínimo 6 caracteres)');
            isValid = false;
        } else if (value.length > 128) {
            showFieldError(field, 'Muito longa (máximo 128 caracteres)');
            isValid = false;
        }
        
        // Check password strength
        const strength = calculatePasswordStrength(value);
        updatePasswordStrengthIndicator(field, strength);
    }
    
    if (isValid) {
        field.classList.add('valid');
        field.classList.remove('error');
    }
    
    return isValid;
}

function setupFieldEnhancements(field) {
    const container = field.closest('.login-field-container, .auth-input-container');
    if (!container) return;
    
    // Animação de foco
    field.addEventListener('focus', function() {
        container.classList.add('focused');
        animateFieldIcon(container);
    });
    
    field.addEventListener('blur', function() {
        container.classList.remove('focused');
        if (!field.value) {
            container.classList.remove('has-value');
        }
    });
    
    field.addEventListener('input', function() {
        if (field.value) {
            container.classList.add('has-value');
        } else {
            container.classList.remove('has-value');
        }
    });
    
    // Estado inicial
    if (field.value) {
        container.classList.add('has-value');
    }
}

function animateFieldIcon(container) {
    const icon = container.querySelector('.login-field-icon, .auth-input-icon');
    if (icon) {
        icon.style.transform = 'scale(1.1)';
        icon.style.color = '#3b82f6';
        
        setTimeout(() => {
            icon.style.transform = '';
        }, 200);
    }
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Critérios de força
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    if (password.length >= 16) strength++;
    
    return Math.min(strength, 5);
}

function updatePasswordStrengthIndicator(field, strength) {
    let indicator = field.parentElement.querySelector('.password-strength-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'password-strength-indicator';
        indicator.innerHTML = `
            <div class="strength-bars">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
            </div>
            <span class="strength-text">Força da senha</span>
        `;
        field.parentElement.appendChild(indicator);
    }
    
    const bars = indicator.querySelectorAll('.bar');
    const text = indicator.querySelector('.strength-text');
    
    // Reset
    bars.forEach(bar => bar.className = 'bar');
    
    // Aplicar força
    const strengthLevels = ['Muito fraca', 'Fraca', 'Regular', 'Boa', 'Forte', 'Muito forte'];
    const strengthClasses = ['very-weak', 'weak', 'fair', 'good', 'strong', 'very-strong'];
    
    for (let i = 0; i < strength; i++) {
        bars[i].classList.add(strengthClasses[Math.min(strength - 1, 5)]);
    }
    
    text.textContent = strengthLevels[strength] || 'Muito fraca';
    text.className = `strength-text ${strengthClasses[Math.min(strength - 1, 5)]}`;
}

/**
 * ===== SEGURANÇA DO LOGIN =====
 */
function initializeLoginSecurity() {
    // Rate limiting
    checkLoginRateLimit();
    
    // Detectar comportamento suspeito
    detectSuspiciousBehavior();
    
    // Proteção contra ataques
    setupSecurityMeasures();
    
    // Monitor de tentativas
    monitorLoginAttempts();
}

function checkLoginRateLimit() {
    const attempts = getLoginAttempts();
    const maxAttempts = 5;
    const blockDuration = 15 * 60 * 1000; // 15 minutos
    
    if (attempts.count >= maxAttempts) {
        const timeRemaining = blockDuration - (Date.now() - attempts.lastAttempt);
        
        if (timeRemaining > 0) {
            blockLoginForm(Math.ceil(timeRemaining / 60000));
            return false;
        } else {
            // Reset depois do tempo de bloqueio
            resetLoginAttempts();
        }
    }
    
    return true;
}

function recordLoginAttempt() {
    const attempts = getLoginAttempts();
    const now = Date.now();
    
    // Reset se passou mais de 1 hora
    if (now - attempts.lastAttempt > 60 * 60 * 1000) {
        attempts.count = 0;
    }
    
    attempts.count++;
    attempts.lastAttempt = now;
    
    localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    
    console.log(`Tentativa de login registrada: ${attempts.count}/5`);
}

function getLoginAttempts() {
    const stored = localStorage.getItem('loginAttempts');
    return stored ? JSON.parse(stored) : { count: 0, lastAttempt: 0 };
}

function resetLoginAttempts() {
    localStorage.removeItem('loginAttempts');
    console.log('Tentativas de login resetadas');
}

function blockLoginForm(minutes) {
    const form = document.querySelector('form[method="post"]');
    const submitBtn = form?.querySelector('button[type="submit"]');
    
    if (form) {
        disableFormFields(form, true);
        
        showLoginError(
            `Muitas tentativas de login. Tente novamente em ${minutes} minuto(s).`,
            'warning',
            0 // Não esconder automaticamente
        );
        
        if (submitBtn) {
            submitBtn.innerHTML = `
                <i class="fas fa-clock"></i>
                <span>Bloqueado (${minutes}min)</span>
            `;
        }
        
        // Countdown
        const countdown = setInterval(() => {
            minutes--;
            if (minutes <= 0) {
                clearInterval(countdown);
                location.reload();
            } else if (submitBtn) {
                submitBtn.innerHTML = `
                    <i class="fas fa-clock"></i>
                    <span>Bloqueado (${minutes}min)</span>
                `;
            }
        }, 60000);
    }
}

function detectSuspiciousBehavior() {
    let rapidClicks = 0;
    let lastClickTime = 0;
    
    document.addEventListener('click', function(e) {
        const now = Date.now();
        
        if (now - lastClickTime < 100) {
            rapidClicks++;
            
            if (rapidClicks > 10) {
                console.warn('Comportamento suspeito detectado: clicks muito rápidos');
                showLoginError('Comportamento suspeito detectado. Aguarde um momento.', 'warning');
                
                // Pequeno delay
                setTimeout(() => {
                    rapidClicks = 0;
                }, 5000);
            }
        } else {
            rapidClicks = 0;
        }
        
        lastClickTime = now;
    });
}

function setupSecurityMeasures() {
    // Prevenir copy/paste em campo de senha (opcional)
    const passwordField = document.querySelector('input[name="password"]');
    if (passwordField) {
        // Comentado pois pode prejudicar UX
        // passwordField.addEventListener('paste', function(e) {
        //     e.preventDefault();
        //     showLoginError('Por segurança, não é possível colar no campo de senha.', 'info');
        // });
    }
    
    // Detectar DevTools (básico)
    detectDevTools();
    
    // Clear de campos sensíveis ao sair da página
    window.addEventListener('beforeunload', function() {
        const passwordField = document.querySelector('input[name="password"]');
        if (passwordField) {
            passwordField.value = '';
        }
    });
}

function detectDevTools() {
    const threshold = 160;
    
    function check() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            console.warn('DevTools possivelmente aberto');
        }
    }
    
    setInterval(check, 1000);
}

function monitorLoginAttempts() {
    // Monitor tentativas em múltiplas abas
    window.addEventListener('storage', function(e) {
        if (e.key === 'loginAttempts') {
            const attempts = JSON.parse(e.newValue || '{"count":0}');
            
            if (attempts.count >= 3) {
                showLoginError(
                    `Atenção: ${attempts.count} tentativas de login detectadas.`,
                    'warning'
                );
            }
        }
    });
}

/**
 * ===== UX ESPECÍFICA DO LOGIN =====
 */
function initializeLoginUX() {
    // Animações de entrada
    animateLoginElements();
    
    // Feedback visual aprimorado
    setupVisualFeedback();
    
    // Keyboard shortcuts
    setupLoginShortcuts();
    
    // Auto-complete enhancements
    enhanceAutoComplete();
    
    // Dynamic placeholders
    setupDynamicPlaceholders();
}

function animateLoginElements() {
    const elements = [
        '.login-card',
        '.login-header',
        '.login-form',
        '.login-footer'
    ];
    
    elements.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 + (index * 150));
        }
    });
}

function setupVisualFeedback() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        // Ripple effect ao focar
        input.addEventListener('focus', function() {
            createRippleEffect(this);
        });
        
        // Sucesso visual ao digitar corretamente
        input.addEventListener('input', function() {
            if (this.value && validateLoginField(this)) {
                this.classList.add('success-pulse');
                setTimeout(() => {
                    this.classList.remove('success-pulse');
                }, 600);
            }
        });
    });
}

function createRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.className = 'input-ripple';
    
    const container = element.parentElement;
    container.style.position = 'relative';
    container.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function setupLoginShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + L para focar no username
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            const usernameField = document.querySelector('#id_username, input[name="username"]');
            if (usernameField) {
                usernameField.focus();
                usernameField.select();
            }
        }
        
        // Ctrl/Cmd + Enter para submit rápido
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const form = document.querySelector('form[method="post"]');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });
}

function enhanceAutoComplete() {
    const usernameField = document.querySelector('#id_username, input[name="username"]');
    const passwordField = document.querySelector('#id_password, input[name="password"]');
    
    if (usernameField) {
        usernameField.setAttribute('autocomplete', 'username');
        usernameField.setAttribute('spellcheck', 'false');
    }
    
    if (passwordField) {
        passwordField.setAttribute('autocomplete', 'current-password');
        passwordField.setAttribute('spellcheck', 'false');
    }
}

function setupDynamicPlaceholders() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    
    inputs.forEach(input => {
        const originalPlaceholder = input.placeholder;
        
        input.addEventListener('focus', function() {
            if (this.placeholder === originalPlaceholder) {
                this.placeholder = '';
            }
        });
        
        input.addEventListener('blur', function() {
            if (!this.value && !this.placeholder) {
                this.placeholder = originalPlaceholder;
            }
        });
    });
}

/**
 * ===== ACESSIBILIDADE DO LOGIN =====
 */
function initializeLoginAccessibility() {
    // Melhorar labels
    enhanceLabels();
    
    // Navegação por teclado
    improveKeyboardNavigation();
    
    // Screen reader support
    setupScreenReaderSupport();
    
    // High contrast support
    setupHighContrastSupport();
}

function enhanceLabels() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        
        if (label && input.hasAttribute('required')) {
            label.setAttribute('aria-required', 'true');
            
            if (!label.textContent.includes('*')) {
                label.innerHTML += ' <span class="required-indicator" aria-label="obrigatório">*</span>';
            }
        }
        
        // Descrições adicionais
        if (input.name === 'username') {
            input.setAttribute('aria-describedby', 'username-help');
            
            if (!document.getElementById('username-help')) {
                const help = document.createElement('div');
                help.id = 'username-help';
                help.className = 'sr-only';
                help.textContent = 'Digite seu nome de usuário ou email';
                input.parentElement.appendChild(help);
            }
        }
    });
}

function improveKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
        'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    // Adicionar indicadores visuais de foco
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.classList.add('keyboard-focus');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('keyboard-focus');
        });
        
        element.addEventListener('mousedown', function() {
            this.classList.remove('keyboard-focus');
        });
    });
}

function setupScreenReaderSupport() {
    // Região para anúncios
    if (!document.getElementById('login-announcer')) {
        const announcer = document.createElement('div');
        announcer.id = 'login-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
    }
    
    window.announceToLoginUser = function(message) {
        const announcer = document.getElementById('login-announcer');
        if (announcer) {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    };
}

function setupHighContrastSupport() {
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast-login');
    }
    
    // Toggle manual (se necessário)
    const contrastToggle = document.querySelector('[data-contrast-toggle]');
    if (contrastToggle) {
        contrastToggle.addEventListener('click', function() {
            document.body.classList.toggle('high-contrast-login');
            localStorage.setItem('high-contrast', document.body.classList.contains('high-contrast-login'));
        });
    }
}

/**
 * ===== FUNCIONALIDADES AUXILIARES =====
 */
function setupPasswordToggle() {
    const passwordToggle = document.querySelector('#passwordToggle, .login-field-toggle, [data-password-toggle]');
    const passwordField = document.querySelector('#id_password, input[name="password"]');
    
    if (passwordToggle && passwordField) {
        passwordToggle.addEventListener('click', function() {
            togglePasswordField(passwordField, this);
        });
    }
}

function togglePasswordField(field, button) {
    const isPassword = field.type === 'password';
    
    field.type = isPassword ? 'text' : 'password';
    
    const icon = button.querySelector('i');
    if (icon) {
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
    
    button.setAttribute('aria-label', isPassword ? 'Esconder senha' : 'Mostrar senha');
    
    // Manter foco
    field.focus();
    
    // Feedback para screen reader
    if (window.announceToLoginUser) {
        window.announceToLoginUser(isPassword ? 'Senha visível' : 'Senha oculta');
    }
}

function setupRememberMe() {
    const rememberCheckbox = document.querySelector('#remember-me, input[name="remember-me"]');
    
    if (rememberCheckbox) {
        // Carregar preferência
        const saved = localStorage.getItem('login-remember-preference');
        if (saved === 'true') {
            rememberCheckbox.checked = true;
        }
        
        // Salvar mudanças
        rememberCheckbox.addEventListener('change', function() {
            localStorage.setItem('login-remember-preference', this.checked);
            
            if (window.announceToLoginUser) {
                window.announceToLoginUser(
                    this.checked ? 'Lembrar de mim ativado' : 'Lembrar de mim desativado'
                );
            }
        });
    }
}

function setupLoginAttempts() {
    // Exibir contador de tentativas se necessário
    const attempts = getLoginAttempts();
    
    if (attempts.count > 0) {
        showLoginInfo(`Tentativas de login: ${attempts.count}/5`);
    }
}

/**
 * ===== FUNÇÕES DE ERRO E FEEDBACK =====
 */
function showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('valid');
    
    // Remover erro anterior
    const existingError = field.parentElement.querySelector('.login-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Adicionar novo erro
    const errorElement = document.createElement('div');
    errorElement.className = 'login-error-message';
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    field.parentElement.appendChild(errorElement);
    
    // Animação
    errorElement.style.opacity = '0';
    errorElement.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        errorElement.style.transition = 'all 0.3s ease-out';
        errorElement.style.opacity = '1';
        errorElement.style.transform = 'translateY(0)';
    }, 10);
    
    // Anunciar erro
    if (window.announceToLoginUser) {
        window.announceToLoginUser(`Erro: ${message}`);
    }
}

function clearFieldError(field) {
    field.classList.remove('error');
    
    const errorElement = field.parentElement.querySelector('.login-error-message');
    if (errorElement) {
        errorElement.style.opacity = '0';
        setTimeout(() => {
            errorElement.remove();
        }, 200);
    }
}

function clearAllLoginErrors() {
    const errors = document.querySelectorAll('.login-error-message');
    errors.forEach(error => {
        error.style.opacity = '0';
        setTimeout(() => {
            error.remove();
        }, 200);
    });
    
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
}

function showLoginError(message, type = 'error', duration = 5000) {
    showLoginAlert(message, type, duration);
}

function showLoginInfo(message, duration = 3000) {
    showLoginAlert(message, 'info', duration);
}

function showLoginAlert(message, type = 'info', duration = 5000) {
    // Remover alert anterior
    const existingAlert = document.querySelector('.login-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `login-alert login-alert-${type}`;
    alert.innerHTML = `
        <div class="login-alert-content">
            <i class="fas fa-${getAlertIcon(type)} login-alert-icon"></i>
            <div class="login-alert-text">
                <div class="login-alert-title">${getAlertTitle(type)}</div>
                <div class="login-alert-description">${message}</div>
            </div>
            <button class="login-alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Inserir no formulário
    const form = document.querySelector('.login-form, form');
    if (form) {
        form.insertBefore(alert, form.firstChild);
    } else {
        document.body.appendChild(alert);
    }
    
    // Animação de entrada
    setTimeout(() => {
        alert.classList.add('show');
    }, 10);
    
    // Auto-hide
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
    
    // Anunciar para screen reader
    if (window.announceToLoginUser) {
        window.announceToLoginUser(message);
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

function getAlertTitle(type) {
    const titles = {
        'success': 'Sucesso',
        'error': 'Erro',
        'warning': 'Atenção',
        'info': 'Informação'
    };
    return titles[type] || 'Informação';
}

function shakeLoginForm() {
    const loginCard = document.querySelector('.login-card, .auth-form-card');
    if (loginCard) {
        loginCard.classList.add('shake');
        setTimeout(() => {
            loginCard.classList.remove('shake');
        }, 500);
    }
}

/**
 * ===== UTILITIES =====
 */
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

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * ===== HOOKS PARA INTEGRAÇÃO =====
 */

// Hook chamado quando login for bem-sucedido (seria chamado pelo backend)
window.onLoginSuccess = function(userData) {
    console.log('✅ Login realizado com sucesso', userData);
    
    // Reset tentativas
    resetLoginAttempts();
    
    // Feedback visual
    showLoginAlert('Login realizado com sucesso! Redirecionando...', 'success', 2000);
    
    // Animação de saída
    const loginCard = document.querySelector('.login-card, .auth-form-card');
    if (loginCard) {
        loginCard.style.transform = 'scale(0.95)';
        loginCard.style.opacity = '0.8';
    }
    
    // Anunciar sucesso
    if (window.announceToLoginUser) {
        window.announceToLoginUser('Login realizado com sucesso');
    }
};

// Hook chamado quando login falhar
window.onLoginError = function(error) {
    console.log('❌ Erro no login', error);
    
    // Registrar tentativa
    recordLoginAttempt();
    
    // Feedback visual
    const message = error.message || 'Nome de usuário ou senha incorretos';
    showLoginAlert(message, 'error');
    
    // Shake form
    shakeLoginForm();
    
    // Reset loading state
    const form = document.querySelector('form[method="post"]');
    if (form) {
        form.dataset.submitting = 'false';
        const submitBtn = form.querySelector('button[type="submit"]');
        setLoginLoadingState(submitBtn, false);
        disableFormFields(form, false);
    }
    
    // Focus no primeiro campo
    const usernameField = document.querySelector('#id_username, input[name="username"]');
    if (usernameField) {
        usernameField.focus();
        usernameField.select();
    }
    
    // Verificar se deve bloquear
    const attempts = getLoginAttempts();
    if (attempts.count >= 5) {
        blockLoginForm(15);
    }
};

/**
 * ===== API PÚBLICA DO LOGIN =====
 */
window.GSLearningLogin = {
    // Form handling
    validateLoginForm,
    handleLoginSubmit,
    setLoginLoadingState,
    
    // Security
    recordLoginAttempt,
    resetLoginAttempts,
    getLoginAttempts,
    checkLoginRateLimit,
    
    // UX
    showLoginError,
    showLoginInfo,
    clearAllLoginErrors,
    shakeLoginForm,
    
    // Password
    togglePasswordField,
    calculatePasswordStrength,
    
    // Accessibility
    announceToLoginUser: window.announceToLoginUser,
    
    // Utilities
    debounce,
    isValidEmail
};

/**
 * ===== EVENT LISTENERS GLOBAIS =====
 */

// Detectar quando usuário volta para a aba
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Verificar se ainda está na rate limit
        checkLoginRateLimit();
        
        // Re-focus no campo se necessário
        const activeElement = document.activeElement;
        if (!activeElement || activeElement === document.body) {
            const usernameField = document.querySelector('#id_username, input[name="username"]');
            if (usernameField && !usernameField.value) {
                setTimeout(() => {
                    usernameField.focus();
                }, 100);
            }
        }
    }
});

// Detectar mudanças de conexão
window.addEventListener('online', function() {
    showLoginInfo('Conexão restaurada', 2000);
});

window.addEventListener('offline', function() {
    showLoginAlert('Sem conexão com a internet', 'warning', 0);
});

// Cleanup ao sair da página
window.addEventListener('beforeunload', function() {
    // Limpar dados sensíveis
    const passwordField = document.querySelector('#id_password, input[name="password"]');
    if (passwordField) {
        passwordField.value = '';
    }
    
    // Reset loading states
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        setLoginLoadingState(submitBtn, false);
    }
});

/**
 * ===== ESTILOS CSS DINÂMICOS =====
 */
// Adicionar estilos CSS necessários para as animações
const style = document.createElement('style');
style.textContent = `
    .shake {
        animation: loginShake 0.5s ease-in-out;
    }
    
    @keyframes loginShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .success-pulse {
        animation: loginSuccessPulse 0.6s ease-out;
    }
    
    @keyframes loginSuccessPulse {
        0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
        100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    
    .input-ripple {
        position: absolute;
        top: 50%;
        left: 1rem;
        width: 20px;
        height: 20px;
        background: rgba(59, 130, 246, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: loginRipple 0.6s ease-out;
    }
    
    @keyframes loginRipple {
        to {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
        }
    }
    
    .keyboard-focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px;
    }
    
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    .password-strength-indicator {
        margin-top: 0.5rem;
    }
    
    .strength-bars {
        display: flex;
        gap: 2px;
        margin-bottom: 0.25rem;
    }
    
    .strength-bars .bar {
        height: 3px;
        flex: 1;
        background: #e5e7eb;
        border-radius: 2px;
        transition: all 0.3s ease;
    }
    
    .strength-bars .bar.very-weak { background: #ef4444; }
    .strength-bars .bar.weak { background: #f97316; }
    .strength-bars .bar.fair { background: #eab308; }
    .strength-bars .bar.good { background: #22c55e; }
    .strength-bars .bar.strong { background: #16a34a; }
    .strength-bars .bar.very-strong { background: #15803d; }
    
    .strength-text {
        font-size: 0.75rem;
        font-weight: 500;
        transition: color 0.3s ease;
    }
    
    .strength-text.very-weak { color: #ef4444; }
    .strength-text.weak { color: #f97316; }
    .strength-text.fair { color: #eab308; }
    .strength-text.good { color: #22c55e; }
    .strength-text.strong { color: #16a34a; }
    .strength-text.very-strong { color: #15803d; }
    
    .caps-lock-warning {
        margin-top: 0.25rem;
        padding: 0.5rem;
        background: #fef3c7;
        color: #92400e;
        border-radius: 0.375rem;
        font-size: 0.8125rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .login-alert {
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease-out;
        margin-bottom: 1rem;
    }
    
    .login-alert.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .high-contrast-login {
        filter: contrast(150%) brightness(110%);
    }
    
    .focused .login-field-icon,
    .focused .auth-input-icon {
        color: #3b82f6 !important;
        transform: scale(1.1);
        transition: all 0.2s ease;
    }
    
    .has-value .login-field-icon,
    .has-value .auth-input-icon {
        color: #6b7280;
    }
`;

document.head.appendChild(style);

console.log('✅ GSLearning login.js carregado com sucesso!');