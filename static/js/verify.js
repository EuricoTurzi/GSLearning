/* GSLEARNING - static/js/verify.js */
/* JavaScript específico para a página de verificação de certificados */

(function() {
    'use strict';

    // ===== CONFIGURAÇÕES GLOBAIS =====
    const CONFIG = {
        ANIMATION_DELAY: 100,
        COPY_FEEDBACK_DURATION: 2000,
        PARTICLE_COUNT: 30,
        CONFETTI_DURATION: 3000
    };

    // ===== CLASSES PRINCIPAIS =====
    class VerifyPageManager {
        constructor() {
            this.init();
        }

        init() {
            this.bindEvents();
            this.setupAnimations();
            this.setupCopyFeatures();
            this.setupParticleEffects();
            this.checkVerificationStatus();
        }

        bindEvents() {
            // Eventos de interação
            document.addEventListener('DOMContentLoaded', () => {
                this.onPageLoad();
            });

            // Eventos de click nos cards
            this.bindCardEvents();
            
            // Eventos de teclado para acessibilidade
            this.bindKeyboardEvents();
        }

        onPageLoad() {
            console.log('🔍 GSLearning - Página de Verificação Carregada');
            this.animateEntranceSequence();
            this.setupTooltips();
        }

        bindCardEvents() {
            const cards = document.querySelectorAll('.dashboard-client-card');
            
            cards.forEach((card, index) => {
                // Hover effects
                card.addEventListener('mouseenter', () => {
                    this.onCardHover(card, true);
                });

                card.addEventListener('mouseleave', () => {
                    this.onCardHover(card, false);
                });

                // Click effects
                card.addEventListener('click', () => {
                    this.onCardClick(card);
                });
            });
        }

        bindKeyboardEvents() {
            document.addEventListener('keydown', (e) => {
                // Esc para remover focus
                if (e.key === 'Escape') {
                    document.activeElement.blur();
                }
                
                // Enter para ativar cards focados
                if (e.key === 'Enter' && e.target.classList.contains('dashboard-client-card')) {
                    this.onCardClick(e.target);
                }
            });
        }

        onCardHover(card, isHovering) {
            const icon = card.querySelector('.card-icon i');
            
            if (isHovering) {
                // Adicionar efeito de brilho
                card.style.filter = 'brightness(1.05)';
                
                // Animação do ícone
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            } else {
                // Remover efeitos
                card.style.filter = '';
                
                if (icon) {
                    icon.style.transform = '';
                }
            }
        }

        onCardClick(card) {
            // Efeito ripple
            this.createRippleEffect(card);
            
            // Vibração sutil (se suportado)
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }

        createRippleEffect(element) {
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                left: 50%;
                top: 50%;
                width: 100px;
                height: 100px;
                margin-left: -50px;
                margin-top: -50px;
                z-index: 10;
            `;

            element.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        }

        setupAnimations() {
            // Adicionar CSS para animação ripple
            const style = document.createElement('style');
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                
                .float-animation {
                    animation: float 3s ease-in-out infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                .glow-pulse {
                    animation: glowPulse 2s ease-in-out infinite alternate;
                }
                
                @keyframes glowPulse {
                    from { filter: brightness(1) drop-shadow(0 0 5px currentColor); }
                    to { filter: brightness(1.2) drop-shadow(0 0 15px currentColor); }
                }
            `;
            document.head.appendChild(style);
        }

        animateEntranceSequence() {
            // Animar entrada dos elementos
            const elements = document.querySelectorAll('.dashboard-client-card');
            
            elements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(50px)';
                
                setTimeout(() => {
                    element.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * CONFIG.ANIMATION_DELAY);
            });
        }

        setupCopyFeatures() {
            // Adicionar funcionalidade de cópia para códigos
            const codeElements = document.querySelectorAll('.font-mono');
            
            codeElements.forEach(element => {
                element.style.cursor = 'pointer';
                element.title = 'Clique para copiar';
                
                element.addEventListener('click', () => {
                    this.copyToClipboard(element.textContent, element);
                });
            });
        }

        async copyToClipboard(text, element) {
            try {
                await navigator.clipboard.writeText(text);
                this.showCopyFeedback(element, 'Copiado!');
            } catch (err) {
                // Fallback para navegadores mais antigos
                this.fallbackCopyToClipboard(text);
                this.showCopyFeedback(element, 'Copiado!');
            }
        }

        fallbackCopyToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Erro ao copiar texto:', err);
            }
            
            document.body.removeChild(textArea);
        }

        showCopyFeedback(element, message) {
            const feedback = document.createElement('div');
            feedback.textContent = message;
            feedback.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
                transform: translateY(-100%);
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            element.style.position = 'relative';
            element.appendChild(feedback);

            // Mostrar feedback
            setTimeout(() => {
                feedback.style.opacity = '1';
            }, 10);

            // Remover feedback
            setTimeout(() => {
                feedback.style.opacity = '0';
                setTimeout(() => {
                    if (feedback.parentNode) {
                        feedback.parentNode.removeChild(feedback);
                    }
                }, 300);
            }, CONFIG.COPY_FEEDBACK_DURATION);
        }

        setupParticleEffects() {
            // Verificar se o certificado é válido para mostrar confetti
            const successCard = document.querySelector('.dashboard-client-card.success');
            
            if (successCard) {
                setTimeout(() => {
                    this.createConfettiEffect();
                }, 1000);
            }
        }

        createConfettiEffect() {
            const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
            const container = document.body;

            for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}vw;
                    top: -20px;
                    z-index: 1000;
                    pointer-events: none;
                    border-radius: 50%;
                    animation: confetti ${2 + Math.random() * 2}s linear forwards;
                `;

                container.appendChild(particle);

                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, CONFIG.CONFETTI_DURATION);
            }

            // Adicionar CSS da animação confetti
            if (!document.getElementById('confetti-styles')) {
                const style = document.createElement('style');
                style.id = 'confetti-styles';
                style.textContent = `
                    @keyframes confetti {
                        0% {
                            transform: translateY(-20px) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(100vh) rotate(720deg);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }

        checkVerificationStatus() {
            // Detectar tipo de verificação pela presença de classes
            const successCard = document.querySelector('.success-pulse');
            const errorCard = document.querySelector('.error-shake');

            if (successCard) {
                this.handleSuccessVerification();
            } else if (errorCard) {
                this.handleErrorVerification();
            }
        }

        handleSuccessVerification() {
            console.log('✅ Certificado válido detectado');
            
            // Adicionar efeitos especiais de sucesso
            const icons = document.querySelectorAll('.fa-check-circle');
            icons.forEach(icon => {
                icon.classList.add('glow-pulse');
            });

            // Vibração de sucesso (se suportado)
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
        }

        handleErrorVerification() {
            console.log('❌ Certificado inválido detectado');
            
            // Adicionar efeitos especiais de erro
            const icons = document.querySelectorAll('.fa-times-circle');
            icons.forEach(icon => {
                icon.style.filter = 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))';
            });

            // Vibração de erro (se suportado)
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
        }

        setupTooltips() {
            // Adicionar tooltips informativos
            const tooltipElements = [
                { selector: '.fa-shield-alt', text: 'Sistema de verificação seguro' },
                { selector: '.fa-certificate', text: 'Certificado digital autêntico' },
                { selector: '.fa-user-graduate', text: 'Dados do participante' },
                { selector: '.fa-laptop', text: 'Equipamento certificado' }
            ];

            tooltipElements.forEach(({ selector, text }) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.title = text;
                });
            });
        }
    }

    // ===== UTILITÁRIOS =====
    class Utils {
        static debounce(func, wait) {
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

        static throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }

        static isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
    }

    // ===== PERFORMANCE MONITOR =====
    class PerformanceMonitor {
        constructor() {
            this.startTime = performance.now();
        }

        logPageLoadTime() {
            const endTime = performance.now();
            const loadTime = endTime - this.startTime;
            console.log(`📊 Página carregada em ${loadTime.toFixed(2)}ms`);
        }
    }

    // ===== INICIALIZAÇÃO =====
    const perfMonitor = new PerformanceMonitor();
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVerifyPage);
    } else {
        initVerifyPage();
    }

    function initVerifyPage() {
        try {
            // Inicializar gerenciador principal
            new VerifyPageManager();
            
            // Log de performance
            perfMonitor.logPageLoadTime();
            
            console.log('🚀 GSLearning Verify - Sistema iniciado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar página de verificação:', error);
        }
    }

    // ===== GLOBAL SCOPE (para debugging) =====
    window.GSLearningVerify = {
        Utils,
        PerformanceMonitor,
        version: '1.0.0'
    };

})();