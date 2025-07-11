// GSLEARNING - static/js/equipment-detail.js
// JavaScript para página de detalhes do equipamento - VERSÃO ENXUTA

document.addEventListener('DOMContentLoaded', function() {
    initializeEquipmentDetail();
});

function initializeEquipmentDetail() {
    // Animar círculo de progresso
    animateProgressCircle();
    
    // Animar barras de progresso dos módulos
    animateModuleProgressBars();
    
    // Configurar hover effects
    setupModuleHoverEffects();
    
    // Ripple effect nos botões
    setupButtonRippleEffects();
    
    // Smooth scroll para módulos
    setupModuleNavigation();
}

// ===== CÍRCULO DE PROGRESSO =====
function animateProgressCircle() {
    const progressCircle = document.querySelector('.progress-circle');
    if (!progressCircle) return;
    
    const progress = parseInt(progressCircle.dataset.progress) || 0;
    
    // Animar de 0 até o valor final
    let currentProgress = 0;
    const increment = progress / 50; // 50 frames de animação
    
    const animation = setInterval(() => {
        currentProgress += increment;
        
        if (currentProgress >= progress) {
            currentProgress = progress;
            clearInterval(animation);
        }
        
        // Atualizar CSS custom property
        progressCircle.style.setProperty('--progress', currentProgress);
        
        // Atualizar cor baseada no progresso
        let color1 = '#3b82f6'; // azul
        let color2 = '#1d4ed8'; // azul escuro
        
        if (currentProgress >= 100) {
            color1 = '#10b981'; // verde
            color2 = '#059669'; // verde escuro
        } else if (currentProgress >= 75) {
            color1 = '#8b5cf6'; // roxo
            color2 = '#7c3aed'; // roxo escuro
        }
        
        progressCircle.style.background = `conic-gradient(
            ${color1} 0deg,
            ${color2} ${currentProgress * 3.6}deg,
            #e5e7eb ${currentProgress * 3.6}deg,
            #e5e7eb 360deg
        )`;
    }, 20);
}

// ===== BARRAS DE PROGRESSO DOS MÓDULOS =====
function animateModuleProgressBars() {
    const progressBars = document.querySelectorAll('.module-progress .progress-fill');
    
    progressBars.forEach((bar, index) => {
        setTimeout(() => {
            const targetWidth = bar.style.width || '0%';
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 100);
        }, index * 200);
    });
}

// ===== HOVER EFFECTS DOS MÓDULOS =====
function setupModuleHoverEffects() {
    const moduleItems = document.querySelectorAll('.module-item');
    
    moduleItems.forEach(moduleItem => {
        const progressBar = moduleItem.querySelector('.progress-fill');
        const statusBadge = moduleItem.querySelector('.status-badge');
        const moduleNumber = moduleItem.querySelector('.module-number');
        
        moduleItem.addEventListener('mouseenter', function() {
            // Efeito na barra de progresso
            if (progressBar) {
                progressBar.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.8)';
            }
            
            // Efeito no badge
            if (statusBadge) {
                statusBadge.style.transform = 'scale(1.05)';
            }
            
            // Efeito no número
            if (moduleNumber) {
                moduleNumber.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        moduleItem.addEventListener('mouseleave', function() {
            if (progressBar) {
                progressBar.style.boxShadow = '';
            }
            
            if (statusBadge) {
                statusBadge.style.transform = 'scale(1)';
            }
            
            if (moduleNumber) {
                moduleNumber.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

// ===== RIPPLE EFFECT NOS BOTÕES =====
function setupButtonRippleEffects() {
    const actionButtons = document.querySelectorAll('.module-action:not(.locked)');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Não fazer ripple se for botão bloqueado
            if (this.classList.contains('locked')) return;
            
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.4)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// ===== NAVEGAÇÃO SUAVE ENTRE MÓDULOS =====
function setupModuleNavigation() {
    // Smooth scroll para links internos (se houver)
    const moduleLinks = document.querySelectorAll('a[href^="#module"]');
    
    moduleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // Highlight temporário
                targetElement.style.background = 'rgba(59, 130, 246, 0.1)';
                setTimeout(() => {
                    targetElement.style.background = '';
                }, 2000);
            }
        });
    });
}

// ===== FUNÇÕES UTILITÁRIAS =====
function updateProgressCircle(newProgress) {
    const progressCircle = document.querySelector('.progress-circle');
    if (!progressCircle) return;
    
    progressCircle.dataset.progress = newProgress;
    animateProgressCircle();
    
    // Atualizar texto
    const percentageElement = progressCircle.querySelector('.progress-percentage');
    if (percentageElement) {
        percentageElement.textContent = newProgress + '%';
    }
}

function highlightModule(moduleId) {
    const moduleElement = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (!moduleElement) return;
    
    // Scroll até o módulo
    moduleElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    
    // Highlight temporário
    moduleElement.style.transform = 'scale(1.02)';
    moduleElement.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.3)';
    
    setTimeout(() => {
        moduleElement.style.transform = '';
        moduleElement.style.boxShadow = '';
    }, 2000);
}

// ===== ATALHOS DE TECLADO SIMPLES =====
document.addEventListener('keydown', function(e) {
    // ESC para voltar
    if (e.key === 'Escape') {
        const backButton = document.querySelector('a[href*="equipment"]');
        if (backButton) {
            backButton.click();
        }
    }
});

// ===== API PÚBLICA =====
window.EquipmentDetail = {
    updateProgressCircle,
    highlightModule,
    animateProgressCircle,
    animateModuleProgressBars
};

// CSS para animação ripple
const rippleCSS = document.createElement('style');
rippleCSS.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .module-action {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(rippleCSS);