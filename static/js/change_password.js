/* GSLEARNING - static/js/change_password.js */
/* JavaScript específico para a página de alteração de senha */

(function() {
    'use strict';

    // ===== CONFIGURAÇÕES GLOBAIS =====
    const CONFIG = {
        MIN_PASSWORD_LENGTH: 8,
        STRENGTH_CHECK_DELAY: 300,
        MATCH_CHECK_DELAY: 200,
        SUBMIT_DEBOUNCE: 1000
    };

    // ===== CLASSE PRINCIPAL =====
    class PasswordChangeManager {
        constructor() {
            this.init();
        }

        init() {
            this.elements = this.getElements();
            this.state = {
                passwordStrength: 0,
                passwordsMatch: false,
                isSubmitting: false
            };
            
            this.bindEvents();
            this.setupPasswordToggles();
            this.setupPasswordValidation();
            this.setupFormValidation();
            
            console.log('🔒 Password Change Manager iniciado');
        }

        getElements() {
            return {
                form: document.getElementById('passwordForm'),
                oldPassword: document.querySelector('input[name="old_password"]'),
                newPassword1: document.querySelector('input[name="new_password1"]'),
                newPassword2: document.querySelector('input[name="new_password2"]'),
                strengthBar: document.getElementById('strengthFill'),
                strengthText: document.getElementById('strengthText'),
                matchIndicator: document.getElementById('passwordMatch'),
                submitBtn: document.getElementById('submitBtn'),
                toggleButtons: document.querySelectorAll('.password-toggle')
            };
        }

        bindEvents() {
            // Eventos de input nos campos de senha
            if (this.elements.newPassword1) {
                this.elements.newPassword1.addEventListener('input', 
                    this.debounce(() => this.checkPasswordStrength(), CONFIG.STRENGTH_CHECK_DELAY)
                );
            }

            if (this.elements.newPassword2) {
                this.elements.newPassword2.addEventListener('input', 
                    this.debounce(() => this.checkPasswordMatch(), CONFIG.MATCH_CHECK_DELAY)
                );
            }

            // Evento de submit do formulário
            if (this.elements.form) {
                this.elements.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            }

            // Eventos de teclado para acessibilidade
            document.addEventListener('keydown', (e) => this.handleKeyboardEvents(e));
        }

        setupPasswordToggles() {
            this.elements.toggleButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.togglePasswordVisibility(button);
                });
            });
        }

        togglePasswordVisibility(button) {
            const targetId = button.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            
            if (targetInput) {
                const isPassword = targetInput.type === 'password';
                
                // Alternar tipo do input
                targetInput.type = isPassword ? 'text' : 'password';
                
                // Alternar ícone
                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
                }
                
                // Alternar classe ativa
                button.classList.toggle('active', isPassword);
                
                // Feedback de acessibilidade
                button.setAttribute('aria-label', 
                    isPassword ? 'Ocultar senha' : 'Mostrar senha'
                );
                
                // Efeito visual
                this.addRippleEffect(button);
            }
        }

        setupPasswordValidation() {
            // Configurar validação em tempo real
            if (this.elements.newPassword1) {
                this.elements.newPassword1.addEventListener('input', () => {
                    this.checkPasswordStrength();
                    this.checkPasswordMatch(); // Também verificar match quando senha1 muda
                });
            }

            if (this.elements.newPassword2) {
                this.elements.newPassword2.addEventListener('input', () => {
                    this.checkPasswordMatch();
                });
            }
        }

        checkPasswordStrength() {
            const password = this.elements.newPassword1?.value || '';
            const strength = this.calculatePasswordStrength(password);
            
            this.state.passwordStrength = strength.score;
            this.updateStrengthIndicator(strength);
            this.updateFormValidation();
        }

        calculatePasswordStrength(password) {
            let score = 0;
            let feedback = [];
            
            // Critérios de força
            const criteria = {
                length: password.length >= CONFIG.MIN_PASSWORD_LENGTH,
                lowercase: /[a-z]/.test(password),
                uppercase: /[A-Z]/.test(password),
                numbers: /\d/.test(password),
                symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
            };
            
            // Calcular pontuação
            Object.values(criteria).forEach(met => {
                if (met) score++;
            });
            
            // Determinar nível e cor
            let level, color, message;
            
            if (password.length === 0) {
                level = 'empty';
                color = 'weak';
                message = 'Digite uma senha';
            } else if (score < 2) {
                level = 'weak';
                color = 'weak';
                message = 'Senha muito fraca';
            } else if (score < 3) {
                level = 'fair';
                color = 'fair';
                message = 'Senha fraca';
            } else if (score < 4) {
                level = 'good';
                color = 'good';
                message = 'Senha boa';
            } else {
                level = 'strong';
                color = 'strong';
                message = 'Senha forte';
            }
            
            return { score, level, color, message, criteria };
        }

        updateStrengthIndicator(strength) {
            if (this.elements.strengthBar && this.elements.strengthText) {
                // Atualizar barra
                this.elements.strengthBar.className = `strength-fill ${strength.color}`;
                
                // Atualizar texto
                this.elements.strengthText.textContent = strength.message;
                this.elements.strengthText.className = `strength-text ${strength.color}`;
                
                // Adicionar ícone baseado no nível
                const icon = this.getStrengthIcon(strength.level);
                this.elements.strengthText.innerHTML = `${icon} ${strength.message}`;
            }
        }

        getStrengthIcon(level) {
            const icons = {
                empty: '<i class="fas fa-circle-notch fa-spin"></i>',
                weak: '<i class="fas fa-exclamation-triangle"></i>',
                fair: '<i class="fas fa-minus-circle"></i>',
                good: '<i class="fas fa-check-circle"></i>',
                strong: '<i class="fas fa-shield-alt"></i>'
            };
            return icons[level] || icons.empty;
        }

        checkPasswordMatch() {
            const password1 = this.elements.newPassword1?.value || '';
            const password2 = this.elements.newPassword2?.value || '';
            
            let match = false;
            let message = '';
            let icon = '';
            
            if (password2.length === 0) {
                message = 'Confirme sua senha';
                icon = '<i class="fas fa-circle-notch fa-spin"></i>';
            } else if (password1 === password2) {
                match = true;
                message = 'Senhas coincidem';
                icon = '<i class="fas fa-check-circle"></i>';
            } else {
                match = false;
                message = 'Senhas não coincidem';
                icon = '<i class="fas fa-times-circle"></i>';
            }
            
            this.state.passwordsMatch = match;
            this.updateMatchIndicator(match, message, icon);
            this.updateFormValidation();
        }

        updateMatchIndicator(match, message, icon) {
            if (this.elements.matchIndicator) {
                this.elements.matchIndicator.innerHTML = `${icon} <span>${message}</span>`;
                
                // Remover classes anteriores
                this.elements.matchIndicator.classList.remove('match', 'no-match');
                
                // Adicionar classe apropriada
                if (this.elements.newPassword2?.value) {
                    this.elements.matchIndicator.classList.add(match ? 'match' : 'no-match');
                }
            }
        }

        setupFormValidation() {
            // Validação em tempo real dos campos
            this.elements.form?.querySelectorAll('input').forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }

        validateField(input) {
            const formGroup = input.closest('.form-group');
            const value = input.value.trim();
            
            // Remover estados anteriores
            formGroup?.classList.remove('success', 'error');
            
            // Validar baseado no tipo de campo
            let isValid = true;
            
            if (input.name === 'old_password') {
                isValid = value.length > 0;
            } else if (input.name === 'new_password1') {
                isValid = this.state.passwordStrength >= 2; // Pelo menos 'fair'
            } else if (input.name === 'new_password2') {
                isValid = this.state.passwordsMatch;
            }
            
            // Aplicar classe visual
            formGroup?.classList.add(isValid ? 'success' : 'error');
            
            return isValid;
        }

        clearFieldError(input) {
            const formGroup = input.closest('.form-group');
            formGroup?.classList.remove('error');
        }

        updateFormValidation() {
            const isValid = this.isFormValid();
            
            if (this.elements.submitBtn) {
                this.elements.submitBtn.disabled = !isValid;
                this.elements.submitBtn.classList.toggle('opacity-50', !isValid);
                this.elements.submitBtn.classList.toggle('cursor-not-allowed', !isValid);
            }
        }

        isFormValid() {
            const hasOldPassword = this.elements.oldPassword?.value.trim().length > 0;
            const hasStrongPassword = this.state.passwordStrength >= 2;
            const passwordsMatch = this.state.passwordsMatch;
            
            return hasOldPassword && hasStrongPassword && passwordsMatch;
        }

        handleFormSubmit(e) {
            if (this.state.isSubmitting) {
                e.preventDefault();
                return;
            }

            // Validar formulário final
            if (!this.isFormValid()) {
                e.preventDefault();
                this.showValidationErrors();
                return;
            }

            // Mostrar loading
            this.setSubmitLoading(true);
            
            // Permitir envio (não prevenir default)
            console.log('✅ Formulário válido, enviando...');
        }

        setSubmitLoading(loading) {
            this.state.isSubmitting = loading;
            
            if (this.elements.submitBtn) {
                this.elements.submitBtn.classList.toggle('loading', loading);
                this.elements.submitBtn.disabled = loading;
                
                const icon = this.elements.submitBtn.querySelector('i');
                if (icon) {
                    icon.className = loading ? 'fas fa-spinner fa-spin' : 'fas fa-key';
                }
                
                const text = this.elements.submitBtn.querySelector('span') || this.elements.submitBtn;
                text.textContent = loading ? 'Alterando...' : 'Alterar Senha';
            }
        }

        showValidationErrors() {
            // Validar todos os campos e mostrar erros
            this.elements.form?.querySelectorAll('input').forEach(input => {
                this.validateField(input);
            });
            
            // Scroll para o primeiro erro
            const firstError = this.elements.form?.querySelector('.form-group.error input');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Vibração no mobile
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
        }

        handleKeyboardEvents(e) {
            // Enter nos campos de senha
            if (e.key === 'Enter' && e.target.type === 'password') {
                const inputs = Array.from(this.elements.form?.querySelectorAll('input[type="password"]') || []);
                const currentIndex = inputs.indexOf(e.target);
                
                if (currentIndex < inputs.length - 1) {
                    // Ir para próximo campo
                    e.preventDefault();
                    inputs[currentIndex + 1].focus();
                } else {
                    // Último campo, tentar submeter
                    if (this.isFormValid()) {
                        this.elements.submitBtn?.focus();
                    }
                }
            }
            
            // Esc para cancelar
            if (e.key === 'Escape') {
                const cancelBtn = document.querySelector('.btn-secondary');
                if (cancelBtn) {
                    cancelBtn.click();
                }
            }
        }

        addRippleEffect(element) {
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(59, 130, 246, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                left: 50%;
                top: 50%;
                width: 20px;
                height: 20px;
                margin-left: -10px;
                margin-top: -10px;
                z-index: 10;
            `;

            element.style.position = 'relative';
            element.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        }

        // Utility function
        debounce(func, wait) {
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
    }

    // ===== FUNCIONALIDADES EXTRAS =====
    class PasswordGenerator {
        static generate(length = 12) {
            const chars = {
                lowercase: 'abcdefghijklmnopqrstuvwxyz',
                uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                numbers: '0123456789',
                symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
            };
            
            let password = '';
            const charTypes = Object.values(chars);
            
            // Garantir pelo menos um de cada tipo
            Object.values(chars).forEach(charSet => {
                password += charSet[Math.floor(Math.random() * charSet.length)];
            });
            
            // Preencher o resto aleatoriamente
            for (let i = password.length; i < length; i++) {
                const randomType = charTypes[Math.floor(Math.random() * charTypes.length)];
                password += randomType[Math.floor(Math.random() * randomType.length)];
            }
            
            // Embaralhar
            return password.split('').sort(() => 0.5 - Math.random()).join('');
        }
    }

    // ===== PERFORMANCE MONITOR =====
    class PerformanceMonitor {
        constructor() {
            this.startTime = performance.now();
        }

        logInitTime() {
            const endTime = performance.now();
            const initTime = endTime - this.startTime;
            console.log(`⚡ Password Change JS iniciado em ${initTime.toFixed(2)}ms`);
        }
    }

    // ===== INICIALIZAÇÃO =====
    const perfMonitor = new PerformanceMonitor();
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPasswordChange);
    } else {
        initPasswordChange();
    }

    function initPasswordChange() {
        try {
            // Inicializar gerenciador principal
            new PasswordChangeManager();
            
            // Log de performance
            perfMonitor.logInitTime();
            
            console.log('🚀 Password Change System iniciado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema de senha:', error);
        }
    }

    // ===== GLOBAL SCOPE (para debugging) =====
    window.GSLearningPassword = {
        PasswordGenerator,
        PerformanceMonitor,
        version: '1.0.0'
    };

    // Adicionar CSS para ripple effect
    if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

})();