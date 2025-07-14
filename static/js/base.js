/* GSLEARNING - static/js/base.js */
/* JavaScript para funcionalidades do template base */

/**
 * ===== INICIALIZAÇÃO =====
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 GSLearning Base JS carregado');
    
    // Inicializar funcionalidades
    initNavigation();
    initUserDropdown();
    initMobileMenu();
    initScrollEffects();
    initAlerts();
    highlightCurrentPage();
    
    console.log('✅ Funcionalidades base inicializadas');
});

/**
 * ===== NAVEGAÇÃO PRINCIPAL =====
 */
function initNavigation() {
    // Adicionar efeitos hover nos links de navegação
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        link.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
    
    console.log('🧭 Navegação inicializada');
}

function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        
        // Remover classe active de todos
        link.classList.remove('active');
        
        // Adicionar active se corresponder
        if (currentPath === linkPath || 
            (linkPath !== '/' && currentPath.startsWith(linkPath))) {
            link.classList.add('active');
        }
    });
    
    console.log('📍 Página atual destacada:', currentPath);
}

/**
 * ===== USER DROPDOWN =====
 */
function initUserDropdown() {
    const userButton = document.querySelector('.user-button');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (!userButton || !dropdownMenu) return;
    
    // Toggle dropdown
    userButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown();
    });
    
    // Fechar ao clicar fora
    document.addEventListener('click', function(e) {
        if (!userButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
            closeDropdown();
        }
    });
    
    // Fechar com Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeDropdown();
        }
    });
    
    // Adicionar efeitos aos itens do dropdown
    const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(2px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    console.log('👤 User dropdown inicializado');
}

function toggleDropdown() {
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const userButton = document.querySelector('.user-button');
    
    if (dropdownMenu.classList.contains('show')) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

function openDropdown() {
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const userButton = document.querySelector('.user-button');
    
    dropdownMenu.classList.add('show');
    userButton.setAttribute('aria-expanded', 'true');
    
    // Adicionar classe para animação
    dropdownMenu.style.animation = 'fadeIn 0.2s ease-out';
}

function closeDropdown() {
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const userButton = document.querySelector('.user-button');
    
    dropdownMenu.classList.remove('show');
    userButton.setAttribute('aria-expanded', 'false');
}

/**
 * ===== MOBILE MENU =====
 */
function initMobileMenu() {
    const mobileButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!mobileButton || !mobileMenu) return;
    
    mobileButton.addEventListener('click', function() {
        toggleMobileMenu();
    });
    
    // Fechar menu mobile ao redimensionar para desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            closeMobileMenu();
        }
    });
    
    // Fechar ao clicar em link
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Delay para permitir navegação
            setTimeout(closeMobileMenu, 100);
        });
    });
    
    console.log('📱 Mobile menu inicializado');
}

function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileButton = document.querySelector('.mobile-menu-button');
    
    if (mobileMenu.classList.contains('show')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileButton = document.querySelector('.mobile-menu-button');
    
    mobileMenu.classList.add('show');
    mobileButton.setAttribute('aria-expanded', 'true');
    
    // Mudar ícone para X
    const icon = mobileButton.querySelector('i');
    if (icon) {
        icon.className = 'fas fa-times text-lg';
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileButton = document.querySelector('.mobile-menu-button');
    
    mobileMenu.classList.remove('show');
    mobileButton.setAttribute('aria-expanded', 'false');
    
    // Restaurar ícone do menu
    const icon = mobileButton.querySelector('i');
    if (icon) {
        icon.className = 'fas fa-bars text-lg';
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
}

/**
 * ===== EFEITOS DE SCROLL =====
 */
function initScrollEffects() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        // Adicionar sombra quando rolar
        if (currentScrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    });
    
    console.log('📜 Efeitos de scroll inicializados');
}

/**
 * ===== SISTEMA DE ALERTS =====
 */
function initAlerts() {
    // Auto-dismiss alerts após 5 segundos
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    
    alerts.forEach(alert => {
        // Adicionar botão de fechar
        if (!alert.querySelector('.alert-close')) {
            const closeBtn = createAlertCloseButton();
            alert.appendChild(closeBtn);
        }
        
        // Auto-dismiss
        setTimeout(() => {
            dismissAlert(alert);
        }, 5000);
    });
    
    console.log('🚨 Sistema de alerts inicializado');
}

function createAlertCloseButton() {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'alert-close ml-auto text-lg hover:opacity-75 transition-opacity';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = function() {
        dismissAlert(this.parentElement);
    };
    return closeBtn;
}

function dismissAlert(alert) {
    if (!alert) return;
    
    alert.style.transition = 'all 0.3s ease';
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 300);
}

function showAlert(message, type = 'info', duration = 5000) {
    const alertContainer = document.querySelector('.alert-container') || createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} mb-4 p-4 rounded-lg border flex items-center`;
    
    // Cores por tipo
    const colors = {
        success: 'bg-green-50 border-green-200 text-green-700',
        error: 'bg-red-50 border-red-200 text-red-700',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        info: 'bg-blue-50 border-blue-200 text-blue-700'
    };
    
    alert.className += ` ${colors[type] || colors.info}`;
    
    // Ícones por tipo
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    alert.innerHTML = `
        <i class="fas ${icons[type] || icons.info} mr-2"></i>
        <span>${message}</span>
        <button class="alert-close ml-auto text-lg hover:opacity-75 transition-opacity">×</button>
    `;
    
    // Adicionar evento de fechar
    alert.querySelector('.alert-close').onclick = function() {
        dismissAlert(alert);
    };
    
    alertContainer.appendChild(alert);
    
    // Auto-dismiss
    if (duration > 0) {
        setTimeout(() => dismissAlert(alert), duration);
    }
    
    return alert;
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.className = 'alert-container fixed top-4 right-4 z-50 max-w-md';
    document.body.appendChild(container);
    return container;
}

/**
 * ===== UTILITÁRIOS GLOBAIS =====
 */
function showLoading(element, text = 'Carregando...') {
    if (!element) return;
    
    element.disabled = true;
    element.dataset.originalText = element.innerHTML;
    element.innerHTML = `
        <i class="fas fa-spinner fa-spin mr-2"></i>
        ${text}
    `;
}

function hideLoading(element) {
    if (!element) return;
    
    element.disabled = false;
    element.innerHTML = element.dataset.originalText || element.innerHTML;
}

function copyToClipboard(text) {
    return navigator.clipboard.writeText(text).then(() => {
        showAlert('Copiado para a área de transferência!', 'success', 2000);
        return true;
    }).catch(() => {
        showAlert('Erro ao copiar para área de transferência', 'error');
        return false;
    });
}

/**
 * ===== ATALHOS DE TECLADO GLOBAIS =====
 */
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K para busca (futuro)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        console.log('🔍 Busca global ativada (futuro)');
    }
    
    // Alt + M para menu mobile
    if (e.altKey && e.key === 'm') {
        e.preventDefault();
        toggleMobileMenu();
    }
    
    // Alt + U para user menu
    if (e.altKey && e.key === 'u') {
        e.preventDefault();
        toggleDropdown();
    }
});

/**
 * ===== EXPORTAR FUNCIONALIDADES =====
 */
window.GSLearningBase = {
    showAlert,
    dismissAlert,
    showLoading,
    hideLoading,
    copyToClipboard,
    toggleDropdown,
    toggleMobileMenu,
    highlightCurrentPage
};

/**
 * ===== LOG DE INICIALIZAÇÃO =====
 */
console.log(`
🌟 GSLearning Base JS
✅ Navegação responsiva
✅ User dropdown funcional
✅ Mobile menu interativo
✅ Sistema de alerts
✅ Efeitos de scroll
✅ Atalhos de teclado
🚀 Pronto para uso!
`);