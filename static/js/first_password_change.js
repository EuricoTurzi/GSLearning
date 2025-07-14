/* GSLEARNING - static/js/first_password_change.js */
/* JavaScript específico para a página de primeiro acesso */

/**
 * ===== INICIALIZAÇÃO =====
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 First Password Change JS carregado');
    
    // Inicializar funcionalidades
    initWelcomeExperience();
    initPasswordValidation();
    initPasswordToggle();
    initFormEnhancements();
    setupKeyboardShortcuts();
    
    console.log('✅ Todas as funcionalidades inicializadas');
});

/**
 * ===== EXPERIÊNCIA DE BOAS-VINDAS =====
 */
function initWelcomeExperience() {
    // Mostrar mensagem de boas-vindas
    setTimeout(() => {
        showWelcomeAlert();
    }, 1000);
    
    // Auto-focus no primeiro campo
    const firstInput = document.querySelector('input[type="password"]');
    if (firstInput) {
        setTimeout(() => {
            firstInput.focus();
        }, 1500);
    }
    
    // Animar entrada dos cards
    animateCardsEntrance();
    
    console.log('🎊 Experiência de boas-vindas inicializada');
}

function showWelcomeAlert() {
    const userName = document.querySelector('.dashboard-header h1').textContent.includes('Bem-vindo') ? 
        'novo usuário' : 'usuário';
    
    showAlert(`🚀 Olá! Estamos felizes em tê-lo conosco no GSLearning!`, 'welcome', 4000);
}

function animateCardsEntrance() {
    const cards = document.querySelectorAll('.dashboard-stat-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 150));
    });
}

/**
 * ===== VALIDAÇÃO DE SENHA EM TEMPO REAL =====
 */
function initPasswordValidation() {
    const newPassword1 = document.querySelector('input[name="new_password1"]');
    const newPassword2 = document.querySelector('input[name="new_password2"]');
    
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
    
    console.log('🔒 Validação de senha inicializada');
}

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
        noCommon: !/123|abc|senha|password|qwerty/i.test(password)
    };
    
    // Calcular pontuação
    score += checks.length ? 25 : 0;
    score += checks.uppercase ? 15 : 0;
    score += checks.lowercase ? 15 : 0;
    score += checks.numbers ? 20 : 0;
    score += checks.symbols ? 20 : 0;
    score += checks.noCommon ? 5 : 0;
    
    // Determinar força
    if (score >= 85) return { score, label: 'Muito Forte', color: 'very-strong', checks };
    if (score >= 65) return { score, label: 'Forte', color: 'strong', checks };
    if (score >= 45) return { score, label: 'Média', color: 'medium', checks };
    if (score >= 25) return { score, label: 'Fraca', color: 'weak', checks };
    return { score, label: 'Muito Fraca', color: 'weak', checks };
}

function updatePasswordStrengthUI(input, strength) {
    // Remover indicador anterior
    const existingIndicator = input.parentElement.querySelector('.password-strength-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Criar indicador compacto
    const indicator = document.createElement('div');
    indicator.className = 'password-strength-indicator';
    indicator.innerHTML = `
        <div class="password-strength-compact">
            <span class="text-sm text-gray-600">Força:</span>
            <span class="strength-badge ${strength.color}">${strength.label}</span>
        </div>
    `;
    
    input.parentElement.appendChild(indicator);
    
    // Atualizar classe do input
    updateInputState(input, strength.color);
}

function validatePasswordMatch(password1, password2) {
    const input2 = document.querySelector('input[name="new_password2"]');
    if (!input2) return;
    
    const isMatch = password1 === password2;
    const isEmpty = !password2;
    
    if (isEmpty) {
        updateInputState(input2, 'default');
        removeMatchIndicator(input2);
    } else if (isMatch && password2.length > 0) {
        updateInputState(input2, 'valid');
        updateMatchIndicator(input2, true);
    } else {
        updateInputState(input2, 'invalid');
        updateMatchIndicator(input2, false);
    }
}

function updateMatchIndicator(input, isMatch) {
    removeMatchIndicator(input);
    
    const indicator = document.createElement('div');
    indicator.className = `password-match-indicator ${isMatch ? 'match' : 'no-match'}`;
    
    if (isMatch) {
        indicator.innerHTML = `
            <i class="fas fa-check-circle text-green-500"></i>
            <span>As senhas coincidem</span>
        `;
    } else {
        indicator.innerHTML = `
            <i class="fas fa-times-circle text-red-500"></i>
            <span>As senhas não coincidem</span>
        `;
    }
    
    input.parentElement.appendChild(indicator);
}

function removeMatchIndicator(input) {
    const existing = input.parentElement.querySelector('.password-match-indicator');
    if (existing) existing.remove();
}

function updateInputState(input, state) {
    // Remover classes anteriores
    input.classList.remove('valid', 'invalid', 'checking');
    
    // Aplicar apenas bordas coloridas, sem fundos pesados
    if (state === 'very-strong' || state === 'strong') {
        input.style.borderColor = '#16a34a';
        input.style.boxShadow = '0 0 0 1px rgba(22, 163, 74, 0.3)';
        input.style.backgroundColor = '#ffffff';
    } else if (state === 'medium') {
        input.style.borderColor = '#3b82f6';
        input.style.boxShadow = '0 0 0 1px rgba(59, 130, 246, 0.3)';
        input.style.backgroundColor = '#ffffff';
    } else if (state === 'weak') {
        input.style.borderColor = '#f59e0b';
        input.style.boxShadow = '0 0 0 1px rgba(245, 158, 11, 0.3)';
        input.style.backgroundColor = '#ffffff';
    } else if (state === 'invalid') {
        input.style.borderColor = '#ef4444';
        input.style.boxShadow = '0 0 0 1px rgba(239, 68, 68, 0.3)';
        input.style.backgroundColor = '#ffffff';
    } else if (state === 'valid') {
        input.style.borderColor = '#16a34a';
        input.style.boxShadow = '0 0 0 1px rgba(22, 163, 74, 0.3)';
        input.style.backgroundColor = '#ffffff';
    } else {
        // Estado padrão
        input.style.borderColor = '#d1d5db';
        input.style.boxShadow = '';
        input.style.backgroundColor = '#ffffff';
    }
}

/**
 * ===== BOTÕES TOGGLE DE SENHA =====
 */
function initPasswordToggle() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        // Criar wrapper se não existir
        if (!input.parentElement.classList.contains('password-toggle-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative password-toggle-wrapper';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            
            // Adicionar classe ao input
            input.classList.add('password-input');
            
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
                
                // Manter foco no input
                input.focus();
            });
            
            wrapper.appendChild(toggleBtn);
        }
    });
    
    console.log('👁️ Botões toggle de senha inicializados');
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
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <div class="loading-spinner"></div>
            Criando senha...
        `;
        
        // Restaurar em caso de erro (timeout)
        setTimeout(() => {
            if (submitBtn.disabled) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }, 10000);
    });
    
    // Melhorar UX dos inputs
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('input-focused');
        });
    });
    
    console.log('📝 Melhorias do formulário inicializadas');
}

function validateFormBeforeSubmit() {
    const newPassword1 = document.querySelector('input[name="new_password1"]').value;
    const newPassword2 = document.querySelector('input[name="new_password2"]').value;
    
    // Validações básicas
    if (!newPassword1) {
        showAlert('Por favor, digite uma nova senha', 'error');
        return false;
    }
    
    if (newPassword1.length < 8) {
        showAlert('A senha deve ter pelo menos 8 caracteres', 'error');
        return false;
    }
    
    if (newPassword1 !== newPassword2) {
        showAlert('As senhas não coincidem', 'error');
        return false;
    }
    
    // Verificar força mínima
    const strength = calculatePasswordStrength(newPassword1);
    if (strength.score < 45) {
        const confirm = window.confirm('Sua senha está fraca. Tem certeza que deseja continuar?');
        if (!confirm) return false;
    }
    
    return true;
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
        
        // Escape para sair
        if (e.key === 'Escape') {
            const confirmExit = window.confirm('Tem certeza que deseja sair? Sua senha não será salva.');
            if (confirmExit) {
                const exitBtn = document.querySelector('a[href*="logout"]');
                if (exitBtn) {
                    exitBtn.click();
                }
            }
        }
        
        // Tab melhorado
        if (e.key === 'Tab') {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.type === 'password') {
                // Adicionar efeito visual no próximo elemento
                setTimeout(() => {
                    const nextElement = document.activeElement;
                    if (nextElement && nextElement !== focusedElement) {
                        nextElement.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.2)';
                        setTimeout(() => {
                            nextElement.style.boxShadow = '';
                        }, 1000);
                    }
                }, 10);
            }
        }
    });
    
    console.log('⌨️ Atalhos de teclado configurados');
}

/**
 * ===== SISTEMA DE ALERTS =====
 */
function showAlert(message, type = 'info', duration = 3000) {
    // Remover alert anterior se existir
    const existingAlert = document.querySelector('.alert-floating');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Criar novo alert
    const alert = document.createElement('div');
    alert.className = `alert-floating ${type}`;
    alert.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <i class="fas ${getAlertIcon(type)} mr-2"></i>
                <span>${message}</span>
            </div>
            <button class="ml-4 text-lg hover:opacity-75 transition-opacity" onclick="this.parentElement.parentElement.remove()">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remover
    if (duration > 0) {
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.opacity = '0';
                alert.style.transform = 'translateX(100%)';
                setTimeout(() => alert.remove(), 300);
            }
        }, duration);
    }
}

function getAlertIcon(type) {
    const icons = {
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        success: 'fa-check-circle',
        info: 'fa-info-circle',
        welcome: 'fa-rocket'
    };
    return icons[type] || icons.info;
}

/**
 * ===== UTILITÁRIOS =====
 */
function showTooltip(element, text, duration = 2000) {
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-0 z-50';
    tooltip.textContent = text;
    
    element.parentElement.style.position = 'relative';
    element.parentElement.appendChild(tooltip);
    
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.remove();
        }
    }, duration);
}

/**
 * ===== EXPORTAR FUNCIONALIDADES =====
 */
window.firstPasswordUtils = {
    validatePasswordStrength,
    validatePasswordMatch,
    updateInputState,
    showAlert,
    showTooltip
};