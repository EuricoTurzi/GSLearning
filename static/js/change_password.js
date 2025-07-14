/* GSLEARNING - static/js/change_password.js */
/* JavaScript específico para a página de alteração de senha */

/**
 * ===== INICIALIZAÇÃO =====
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Change Password JS carregado');
    
    // Inicializar funcionalidades
    initPasswordValidation();
    initFormEnhancements();
    initSecurityFeatures();
    setupKeyboardShortcuts();
    
    // Compatibilidade com dashboard.js
    if (typeof window.dashboardUtils !== 'undefined') {
        console.log('🔗 Integração com dashboard.js ativa');
    }
});

/**
 * ===== VALIDAÇÃO DE SENHA EM TEMPO REAL =====
 */
function initPasswordValidation() {
    const newPassword1 = document.querySelector('input[name="new_password1"]');
    const newPassword2 = document.querySelector('input[name="new_password2"]');
    const oldPassword = document.querySelector('input[name="old_password"]');
    
    if (!newPassword1 || !newPassword2) return;
    
    // Validação em tempo real para nova senha
    newPassword1.addEventListener('input', function() {
        validatePasswordStrength(this.value);
        if (newPassword2.value) {
            validatePasswordMatch(this.value, newPassword2.value);
        }
    });
    
    // Validação de confirmação de senha
    newPassword2.addEventListener('input', function() {
        validatePasswordMatch(newPassword1.value, this.value);
    });
    
    // Validação de senha atual
    if (oldPassword) {
        oldPassword.addEventListener('input', function() {
            validateCurrentPassword(this);
        });
    }
    
    console.log('✅ Validação de senha inicializada');
}

/**
 * ===== VALIDAÇÃO DE FORÇA DA SENHA =====
 */
function validatePasswordStrength(password) {
    const input = document.querySelector('input[name="new_password1"]');
    if (!input) return;
    
    const strength = calculatePasswordStrength(password);
    updatePasswordStrengthUI(input, strength);
}

function calculatePasswordStrength(password) {
    if (!password) return { score: 0, label: 'Muito Fraca', color: 'red' };
    
    let score = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /\d/.test(password),
        symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        noPersonal: !/123|abc|senha|password/i.test(password)
    };
    
    // Calcular pontuação
    score += checks.length ? 20 : 0;
    score += checks.uppercase ? 15 : 0;
    score += checks.lowercase ? 15 : 0;
    score += checks.numbers ? 20 : 0;
    score += checks.symbols ? 20 : 0;
    score += checks.noPersonal ? 10 : 0;
    
    // Determinar força
    if (score >= 80) return { score, label: 'Muito Forte', color: 'green', checks };
    if (score >= 60) return { score, label: 'Forte', color: 'blue', checks };
    if (score >= 40) return { score, label: 'Média', color: 'yellow', checks };
    if (score >= 20) return { score, label: 'Fraca', color: 'orange', checks };
    return { score, label: 'Muito Fraca', color: 'red', checks };
}

function updatePasswordStrengthUI(input, strength) {
    // Remover indicador anterior
    const existingIndicator = input.parentElement.querySelector('.password-strength-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Criar indicador compacto apenas com badge
    const indicator = document.createElement('div');
    indicator.className = 'password-strength-indicator mt-2';
    indicator.innerHTML = `
        <div class="password-strength-compact">
            <span class="text-sm text-gray-600">Força:</span>
            <span class="strength-badge ${strength.color.replace('green', 'very-strong').replace('blue', 'strong').replace('yellow', 'medium').replace('orange', 'medium').replace('red', 'weak')}">${strength.label}</span>
        </div>
    `;
    
    input.parentElement.appendChild(indicator);
    
    // Atualizar borda do input
    updateInputBorder(input, strength.color);
}

/**
 * ===== VALIDAÇÃO DE CONFIRMAÇÃO DE SENHA =====
 */
function validatePasswordMatch(password1, password2) {
    const input2 = document.querySelector('input[name="new_password2"]');
    if (!input2) return;
    
    const isMatch = password1 === password2;
    const isEmpty = !password2;
    
    if (isEmpty) {
        updateInputBorder(input2, 'gray');
        removeMatchIndicator(input2);
    } else if (isMatch) {
        updateInputBorder(input2, 'green');
        updateMatchIndicator(input2, true);
    } else {
        updateInputBorder(input2, 'red');
        updateMatchIndicator(input2, false);
    }
}

function updateMatchIndicator(input, isMatch) {
    removeMatchIndicator(input);
    
    const indicator = document.createElement('div');
    indicator.className = 'password-match-indicator mt-1 text-sm flex items-center';
    
    if (isMatch) {
        indicator.innerHTML = `
            <i class="fas fa-check-circle text-green-500 mr-1"></i>
            <span class="text-green-600">As senhas coincidem</span>
        `;
    } else {
        indicator.innerHTML = `
            <i class="fas fa-times-circle text-red-500 mr-1"></i>
            <span class="text-red-600">As senhas não coincidem</span>
        `;
    }
    
    input.parentElement.appendChild(indicator);
}

function removeMatchIndicator(input) {
    const existing = input.parentElement.querySelector('.password-match-indicator');
    if (existing) existing.remove();
}

/**
 * ===== VALIDAÇÃO DE SENHA ATUAL =====
 */
function validateCurrentPassword(input) {
    const hasValue = input.value.length > 0;
    updateInputBorder(input, hasValue ? 'blue' : 'gray');
}

/**
 * ===== UTILITÁRIOS DE UI =====
 */
function updateInputBorder(input, color) {
    // Remover classes anteriores
    input.classList.remove(
        'border-gray-300', 'border-red-500', 'border-green-500', 
        'border-blue-500', 'border-yellow-500', 'border-orange-500'
    );
    
    // Adicionar nova classe
    input.classList.add(`border-${color}-500`);
    
    // Adicionar efeito de foco
    input.classList.remove('focus:ring-red-500', 'focus:ring-green-500', 'focus:ring-blue-500');
    input.classList.add(`focus:ring-${color}-500`);
}

/**
 * ===== MELHORIAS DO FORMULÁRIO =====
 */
function initFormEnhancements() {
    const form = document.querySelector('form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!form || !submitBtn) return;
    
    // Loading state no submit
    form.addEventListener('submit', function(e) {
        if (!validateFormBeforeSubmit()) {
            e.preventDefault();
            return;
        }
        
        // Mostrar loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Alterando senha...
        `;
    });
    
    // Auto-focus no primeiro campo
    const firstInput = form.querySelector('input[type="password"]');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
    
    console.log('✅ Melhorias do formulário inicializadas');
}

function validateFormBeforeSubmit() {
    const oldPassword = document.querySelector('input[name="old_password"]').value;
    const newPassword1 = document.querySelector('input[name="new_password1"]').value;
    const newPassword2 = document.querySelector('input[name="new_password2"]').value;
    
    // Validações básicas
    if (!oldPassword) {
        showAlert('Por favor, digite sua senha atual', 'error');
        return false;
    }
    
    if (!newPassword1) {
        showAlert('Por favor, digite uma nova senha', 'error');
        return false;
    }
    
    if (newPassword1 !== newPassword2) {
        showAlert('As senhas não coincidem', 'error');
        return false;
    }
    
    if (newPassword1.length < 8) {
        showAlert('A nova senha deve ter pelo menos 8 caracteres', 'error');
        return false;
    }
    
    if (oldPassword === newPassword1) {
        showAlert('A nova senha deve ser diferente da senha atual', 'error');
        return false;
    }
    
    return true;
}

/**
 * ===== RECURSOS DE SEGURANÇA =====
 */
function initSecurityFeatures() {
    // Mostrar/ocultar senha
    addPasswordToggleButtons();
    
    // Prevenir ataques de força bruta (rate limiting)
    setupRateLimiting();
    
    // Detectar copy/paste
    monitorPasswordActions();
    
    console.log('🔒 Recursos de segurança inicializados');
}

function addPasswordToggleButtons() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        // Adicionar classe para padding direito
        input.classList.add('password-input');
        
        // Criar wrapper se não existir
        if (!input.parentElement.classList.contains('password-toggle-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative password-toggle-wrapper';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            
            // Criar botão toggle
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'password-toggle-btn';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
            
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                this.innerHTML = isPassword ? 
                    '<i class="fas fa-eye-slash"></i>' : 
                    '<i class="fas fa-eye"></i>';
            });
            
            wrapper.appendChild(toggleBtn);
        }
    });
}

function setupRateLimiting() {
    let attemptCount = 0;
    const maxAttempts = 5;
    const lockoutTime = 5 * 60 * 1000; // 5 minutos
    
    const form = document.querySelector('form');
    form.addEventListener('submit', function(e) {
        attemptCount++;
        
        if (attemptCount >= maxAttempts) {
            e.preventDefault();
            showAlert(`Muitas tentativas. Tente novamente em ${lockoutTime/60000} minutos.`, 'error');
            
            setTimeout(() => {
                attemptCount = 0;
            }, lockoutTime);
        }
    });
}

function monitorPasswordActions() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        input.addEventListener('paste', function() {
            console.log('⚠️ Senha colada detectada');
            showAlert('Evite colar senhas por segurança', 'warning');
        });
        
        input.addEventListener('copy', function() {
            console.log('⚠️ Tentativa de copiar senha detectada');
            showAlert('Não recomendamos copiar senhas', 'warning');
        });
    });
}

/**
 * ===== ATALHOS DE TECLADO =====
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter para submeter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
        }
        
        // Escape para cancelar
        if (e.key === 'Escape') {
            const cancelBtn = document.querySelector('a[href*="dashboard"]');
            if (cancelBtn) {
                cancelBtn.click();
            }
        }
    });
    
    console.log('⌨️ Atalhos de teclado configurados');
}

/**
 * ===== UTILITÁRIOS =====
 */
function showAlert(message, type = 'info') {
    // Criar alert temporário
    const alert = document.createElement('div');
    alert.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${getAlertClasses(type)}`;
    alert.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${getAlertIcon(type)} mr-2"></i>
            <span>${message}</span>
            <button class="ml-4 text-lg">&times;</button>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
    
    // Remover ao clicar no X
    alert.querySelector('button').addEventListener('click', () => {
        alert.remove();
    });
}

function getAlertClasses(type) {
    const classes = {
        error: 'bg-red-100 border border-red-400 text-red-700',
        warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
        success: 'bg-green-100 border border-green-400 text-green-700',
        info: 'bg-blue-100 border border-blue-400 text-blue-700'
    };
    return classes[type] || classes.info;
}

function getAlertIcon(type) {
    const icons = {
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        success: 'fa-check-circle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

/**
 * ===== EXPORTAR FUNCIONALIDADES =====
 */
window.changePasswordUtils = {
    validatePasswordStrength,
    validatePasswordMatch,
    updateInputBorder,
    showAlert
};