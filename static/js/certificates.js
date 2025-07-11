// GSLEARNING - static/js/certificates.js
// JavaScript específico para a página de certificados

/**
 * ===== INICIALIZAÇÃO PRINCIPAL =====
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎓 Certificados: Inicializando...');
    
    // Inicializar todas as funcionalidades
    initializeCertificates();
    initializeAnimations();
    initializeInteractions();
    initializeCounters();
    initializeNotifications();
    
    console.log('✅ Certificados: Carregado com sucesso!');
});

/**
 * ===== INICIALIZAÇÃO DE CERTIFICADOS =====
 */
function initializeCertificates() {
    // Configurar loading states
    setupLoadingStates();
    
    // Configurar tooltips
    setupCertificateTooltips();
    
    // Configurar keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Configurar auto-refresh
    setupAutoRefresh();
}

/**
 * ===== ANIMAÇÕES PRINCIPAIS =====
 */
function initializeAnimations() {
    // Animar entrada dos cards
    animateCardEntrance();
    
    // Intersection Observer para animações on-scroll
    setupScrollAnimations();
    
    // Hover effects avançados
    setupHoverEffects();
    
    // Micro-animações
    setupMicroAnimations();
}

function animateCardEntrance() {
    // Animar cards de estatísticas
    const statCards = document.querySelectorAll('.dashboard-client-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.9)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, 150 + (index * 150));
    });
    
    // Animar cards de certificados
    const certificateCards = document.querySelectorAll('.certificate-card, .empty-state-card');
    certificateCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(-50px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
        }, 400 + (index * 200));
    });
    
    // Animar botões
    const buttons = document.querySelectorAll('.certificate-btn');
    buttons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            button.style.transition = 'all 0.4s ease-out';
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 800 + (index * 100));
    });
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Animações específicas por elemento
                if (entry.target.classList.contains('dashboard-client-card')) {
                    animateStatCard(entry.target);
                }
                
                if (entry.target.classList.contains('certificate-card')) {
                    animateCertificateCard(entry.target);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observar todos os elementos animáveis
    document.querySelectorAll('.dashboard-client-card, .certificate-card').forEach(el => {
        observer.observe(el);
    });
}

function animateStatCard(card) {
    const number = card.querySelector('.card-number');
    const icon = card.querySelector('.card-icon i');
    
    if (number) {
        animateNumber(number);
    }
    
    if (icon) {
        icon.style.animation = 'bounce 1s ease-in-out';
    }
}

function animateCertificateCard(card) {
    card.style.animation = 'slideInLeft 0.6s ease-out';
}

/**
 * ===== CONTADORES ANIMADOS =====
 */
function initializeCounters() {
    const numbers = document.querySelectorAll('.card-number');
    numbers.forEach(animateNumber);
}

function animateNumber(numberElement) {
    const targetNumber = parseInt(numberElement.textContent.replace(/\D/g, '')) || 0;
    
    if (targetNumber > 0) {
        let currentNumber = 0;
        const increment = targetNumber / 50; // 50 frames de animação
        const isPercentage = numberElement.textContent.includes('%');
        
        const numberAnimation = setInterval(() => {
            currentNumber += increment;
            
            if (currentNumber >= targetNumber) {
                currentNumber = targetNumber;
                clearInterval(numberAnimation);
                
                // Efeito de "pop" no final
                numberElement.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    numberElement.style.transform = 'scale(1)';
                }, 200);
            }
            
            numberElement.textContent = Math.floor(currentNumber) + (isPercentage ? '%' : '');
        }, 30);
    }
}

/**
 * ===== INTERAÇÕES E FEEDBACK =====
 */
function initializeInteractions() {
    // Feedback para downloads
    setupDownloadFeedback();
    
    // Feedback para verificação
    setupVerificationFeedback();
    
    // Click tracking
    setupClickTracking();
    
    // Copy to clipboard
    setupClipboardCopy();
}

function setupDownloadFeedback() {
    const downloadButtons = document.querySelectorAll('a[href*="download"]');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Adicionar efeito visual de clique
            createRippleEffect(this, e);
            
            // Mostrar notificação
            showNotification('📥 Download iniciado!', 'success');
            
            // Adicionar classe de loading temporária
            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 2000);
            
            // Tracking
            trackCertificateDownload(this);
        });
    });
}

function setupVerificationFeedback() {
    const verifyButtons = document.querySelectorAll('a[href*="verify"]');
    
    verifyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            createRippleEffect(this, e);
            showNotification('🔍 Abrindo verificação...', 'info');
            trackCertificateVerification(this);
        });
    });
}

function createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.className = 'ripple';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * ===== SISTEMA DE NOTIFICAÇÕES =====
 */
function initializeNotifications() {
    // Criar container de notificações se não existir
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
    }
}

function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    notification.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                <i class="fas fa-times text-sm"></i>
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    // Remover automaticamente
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

/**
 * ===== HOVER EFFECTS AVANÇADOS =====
 */
function setupHoverEffects() {
    // Cards de estatísticas
    const statCards = document.querySelectorAll('.dashboard-client-card');
    statCards.forEach(setupStatCardHover);
    
    // Botões de certificado
    const certButtons = document.querySelectorAll('.certificate-btn');
    certButtons.forEach(setupButtonHover);
}

function setupStatCardHover(card) {
    const icon = card.querySelector('.card-icon i');
    const number = card.querySelector('.card-number');
    
    card.addEventListener('mouseenter', function() {
        // Animação do ícone
        if (icon) {
            icon.style.animation = 'pulse 1s infinite';
        }
        
        // Efeito no número
        if (number) {
            number.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
        }
        
        // Adicionar partículas
        createParticles(this);
    });
    
    card.addEventListener('mouseleave', function() {
        if (icon) {
            icon.style.animation = '';
        }
        
        if (number) {
            number.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
        }
    });
}

function setupButtonHover(button) {
    button.addEventListener('mouseenter', function() {
        const icon = this.querySelector('i');
        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(5deg)';
        }
    });
    
    button.addEventListener('mouseleave', function() {
        const icon = this.querySelector('i');
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
    });
}

function createParticles(element) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                pointer-events: none;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: particleFloat 2s ease-out forwards;
            `;
            
            element.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2000);
        }, i * 200);
    }
}

/**
 * ===== MICRO-ANIMAÇÕES =====
 */
function setupMicroAnimations() {
    // Animação de loading nos botões
    const buttons = document.querySelectorAll('.certificate-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';
                this.classList.add('loading');
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.classList.remove('loading');
                }, 2000);
            }
        });
    });
}

/**
 * ===== UTILIDADES =====
 */
function setupLoadingStates() {
    const cards = document.querySelectorAll('.dashboard-client-card');
    cards.forEach(card => {
        const number = card.querySelector('.card-number');
        if (number && number.textContent.trim() === '0') {
            card.classList.add('loading');
            setTimeout(() => {
                card.classList.remove('loading');
            }, 1500);
        }
    });
}

function setupCertificateTooltips() {
    const elements = document.querySelectorAll('[data-tooltip]');
    elements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + D para download do primeiro certificado
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            const firstDownload = document.querySelector('a[href*="download"]');
            if (firstDownload) {
                firstDownload.click();
                showNotification('⌨️ Atalho executado!', 'info');
            }
        }
    });
}

function setupClickTracking() {
    document.addEventListener('click', function(e) {
        const element = e.target.closest('.dashboard-client-card, .certificate-btn');
        if (element) {
            console.log('📊 Clique registrado:', element.className);
        }
    });
}

function setupClipboardCopy() {
    const codeElements = document.querySelectorAll('[data-certificate-code]');
    codeElements.forEach(element => {
        element.addEventListener('click', function() {
            const code = this.dataset.certificateCode;
            navigator.clipboard.writeText(code).then(() => {
                showNotification('📋 Código copiado!', 'success');
            });
        });
    });
}

function trackCertificateDownload(button) {
    console.log('📥 Download de certificado rastreado');
    // Aqui você pode adicionar Google Analytics ou outro sistema de tracking
}

function trackCertificateVerification(button) {
    console.log('🔍 Verificação de certificado rastreada');
    // Aqui você pode adicionar tracking de verificação
}

function setupAutoRefresh() {
    // Auto-refresh opcional (desabilitado por padrão)
    // setInterval(() => {
    //     console.log('🔄 Auto-refresh executado');
    // }, 30000);
}

function showTooltip(e) {
    // Implementação de tooltip personalizado
    const tooltip = document.createElement('div');
    tooltip.textContent = e.target.dataset.tooltip;
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
}

function hideTooltip() {
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
}

// CSS adicional para animações
const additionalStyles = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: rippleAnimation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes rippleAnimation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes particleFloat {
        0% {
            opacity: 1;
            transform: translateY(0px);
        }
        100% {
            opacity: 0;
            transform: translateY(-50px);
        }
    }
    
    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
        }
        40%, 43% {
            transform: translate3d(0,-10px,0);
        }
        70% {
            transform: translate3d(0,-5px,0);
        }
        90% {
            transform: translate3d(0,-2px,0);
        }
    }
    
    .loading {
        opacity: 0.7;
        pointer-events: none;
    }
    
    .tooltip {
        position: absolute;
        background: #374151;
        color: white;
        padding: 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        z-index: 1000;
        pointer-events: none;
    }
`;

// Adicionar estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

console.log('🎓 Certificados JS: Todas as funcionalidades carregadas!');