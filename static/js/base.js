// GSLEARNING - static/js/base.js
// JavaScript global para toda a plataforma GSLearning

/**
 * ===== INICIALIZAÇÃO GLOBAL =====
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 GSLearning - Sistema inicializado');
    
    // Inicializar todos os módulos
    initializeGlobalFeatures();
    initializeNavigation();
    initializeAlerts();
    initializeModals();
    initializeTooltips();
    initializeConfirmActions();
    initializeLoadingStates();
    initializeFormValidation();
    
    // Debug info
    if (window.location.hostname === 'localhost') {
        console.log('🔧 Modo desenvolvimento ativo');
    }
});

/**
 * ===== FEATURES GLOBAIS =====
 */
function initializeGlobalFeatures() {
    // Auto-hide alerts após 5 segundos
    autoHideAlerts();
    
    // Smooth scroll para links internos
    enableSmoothScroll();
    
    // Lazy loading para imagens
    enableLazyLoading();
    
    // Keyboard shortcuts globais
    setupKeyboardShortcuts();
}

/**
 * ===== NAVEGAÇÃO =====
 */
function initializeNavigation() {
    const mobileMenuBtn = document.querySelector('[data-mobile-menu]');
    const mobileMenu = document.querySelector('[data-mobile-menu-content]');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            toggleMobileMenu();
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }
    
    // Highlight da página atual
    highlightCurrentPage();
    
    // Dropdown de usuário
    initializeUserDropdown();
}

function toggleMobileMenu() {
    const mobileMenu = document.querySelector('[data-mobile-menu-content]');
    const isOpen = mobileMenu.classList.contains('show');
    
    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const mobileMenu = document.querySelector('[data-mobile-menu-content]');
    const backdrop = createBackdrop();
    
    mobileMenu.classList.add('show');
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    
    // Animação de entrada
    setTimeout(() => {
        mobileMenu.style.transform = 'translateX(0)';
        backdrop.style.opacity = '1';
    }, 10);
}

function closeMobileMenu() {
    const mobileMenu = document.querySelector('[data-mobile-menu-content]');
    const backdrop = document.querySelector('.mobile-backdrop');
    
    if (mobileMenu.classList.contains('show')) {
        mobileMenu.style.transform = 'translateX(-100%)';
        
        if (backdrop) {
            backdrop.style.opacity = '0';
        }
        
        setTimeout(() => {
            mobileMenu.classList.remove('show');
            if (backdrop) {
                backdrop.remove();
            }
            document.body.style.overflow = '';
        }, 300);
    }
}

function createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-backdrop fixed inset-0 bg-black bg-opacity-50 z-40 opacity-0 transition-opacity duration-300';
    backdrop.addEventListener('click', closeMobileMenu);
    return backdrop;
}

function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (currentPath === linkPath || currentPath.startsWith(linkPath + '/')) {
            link.classList.add('active');
        }
    });
}

function initializeUserDropdown() {
    const dropdownBtn = document.querySelector('[data-user-dropdown]');
    const dropdownMenu = document.querySelector('[data-user-dropdown-menu]');
    
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleUserDropdown();
        });
        
        // Fechar ao clicar fora
        document.addEventListener('click', function() {
            closeUserDropdown();
        });
    }
}

function toggleUserDropdown() {
    const dropdownMenu = document.querySelector('[data-user-dropdown-menu]');
    dropdownMenu.classList.toggle('show');
}

function closeUserDropdown() {
    const dropdownMenu = document.querySelector('[data-user-dropdown-menu]');
    dropdownMenu.classList.remove('show');
}

/**
 * ===== ALERTAS E NOTIFICAÇÕES =====
 */
function initializeAlerts() {
    // Adicionar botão de fechar em alertas
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    
    alerts.forEach(alert => {
        if (!alert.querySelector('.alert-close')) {
            const closeBtn = createAlertCloseButton();
            alert.appendChild(closeBtn);
            alert.classList.add('alert-dismissible');
        }
    });
}

function createAlertCloseButton() {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'alert-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.addEventListener('click', function() {
        dismissAlert(this.parentElement);
    });
    return closeBtn;
}

function dismissAlert(alert) {
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        alert.remove();
    }, 300);
}

function autoHideAlerts() {
    const autoHideAlerts = document.querySelectorAll('.alert[data-auto-hide]');
    
    autoHideAlerts.forEach(alert => {
        const delay = parseInt(alert.dataset.autoHide) || 5000;
        
        setTimeout(() => {
            if (document.body.contains(alert)) {
                dismissAlert(alert);
            }
        }, delay);
    });
}

function showNotification(message, type = 'info', duration = 5000) {
    const notification = createNotification(message, type);
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide
    if (duration > 0) {
        setTimeout(() => {
            hideNotification(notification);
        }, duration);
    }
    
    return notification;
}

function createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)} notification-icon"></i>
            <span class="notification-text">${message}</span>
            <button class="notification-close" onclick="hideNotification(this.parentElement.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    return notification;
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 300);
}

/**
 * ===== MODAIS =====
 */
function initializeModals() {
    // Fechar modais com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Fechar modais ao clicar no backdrop
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal(e.target.closest('.modal'));
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus no primeiro elemento focável
        const firstFocusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => closeModal(modal));
}

/**
 * ===== TOOLTIPS =====
 */
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('focus', showTooltip);
        element.addEventListener('blur', hideTooltip);
    });
}

function showTooltip(e) {
    const element = e.target;
    const tooltipText = element.dataset.tooltip;
    const position = element.dataset.tooltipPosition || 'top';
    
    if (!tooltipText) return;
    
    const tooltip = createTooltip(tooltipText, position);
    document.body.appendChild(tooltip);
    
    positionTooltip(tooltip, element, position);
    
    setTimeout(() => {
        tooltip.classList.add('show');
    }, 10);
}

function hideTooltip(e) {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => {
            tooltip.remove();
        }, 200);
    }
}

function createTooltip(text, position) {
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${position}`;
    tooltip.textContent = text;
    return tooltip;
}

function positionTooltip(tooltip, element, position) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let top, left;
    
    switch (position) {
        case 'top':
            top = rect.top - tooltipRect.height - 8;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
            break;
        case 'bottom':
            top = rect.bottom + 8;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
            break;
        case 'left':
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.left - tooltipRect.width - 8;
            break;
        case 'right':
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.right + 8;
            break;
    }
    
    // Ajustar se sair da tela
    top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
    
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
}

/**
 * ===== CONFIRMAÇÕES DE AÇÕES =====
 */
function initializeConfirmActions() {
    const confirmElements = document.querySelectorAll('[data-confirm]');
    
    confirmElements.forEach(element => {
        element.addEventListener('click', function(e) {
            const message = this.dataset.confirm;
            const action = this.dataset.confirmAction || 'esta ação';
            
            if (!confirm(`Tem certeza que deseja ${action}?\n\n${message}`)) {
                e.preventDefault();
                return false;
            }
        });
    });
}

/**
 * ===== LOADING STATES =====
 */
function initializeLoadingStates() {
    // Loading automático em formulários
    const forms = document.querySelectorAll('form[data-loading]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn) {
                setLoadingState(submitBtn, true);
            }
        });
    });
}

function setLoadingState(element, loading) {
    if (loading) {
        element.classList.add('loading');
        element.disabled = true;
        element.dataset.originalText = element.textContent;
        element.textContent = 'Carregando...';
    } else {
        element.classList.remove('loading');
        element.disabled = false;
        if (element.dataset.originalText) {
            element.textContent = element.dataset.originalText;
        }
    }
}

function showPageLoading() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="page-loader-content">
            <div class="page-loader-spinner"></div>
            <p>Carregando...</p>
        </div>
    `;
    document.body.appendChild(loader);
}

function hidePageLoading() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.remove();
    }
}

/**
 * ===== VALIDAÇÃO DE FORMULÁRIOS =====
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
        
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    // Limpar erro anterior
    clearFieldError(field);
    
    // Validação de campo obrigatório
    if (required && !value) {
        showFieldError(field, 'Este campo é obrigatório');
        return false;
    }
    
    // Validações específicas por tipo
    if (value) {
        if (type === 'email' && !isValidEmail(value)) {
            showFieldError(field, 'Digite um email válido');
            return false;
        }
        
        if (field.dataset.minLength && value.length < parseInt(field.dataset.minLength)) {
            showFieldError(field, `Mínimo de ${field.dataset.minLength} caracteres`);
            return false;
        }
    }
    
    // Campo válido
    field.classList.add('valid');
    return true;
}

function validateForm(form) {
    const fields = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('valid');
    
    // Remover mensagem de erro anterior
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Adicionar nova mensagem de erro
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    field.parentElement.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * ===== UTILITIES =====
 */
function enableSmoothScroll() {
    const smoothLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function enableLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback para navegadores sem suporte
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K para busca
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"], input[name="search"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Esc para fechar modais/dropdowns
        if (e.key === 'Escape') {
            closeAllModals();
            closeUserDropdown();
            closeMobileMenu();
        }
    });
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * ===== API PÚBLICA =====
 */
window.GSLearning = {
    // Navegação
    openMobileMenu,
    closeMobileMenu,
    toggleUserDropdown,
    
    // Notificações
    showNotification,
    hideNotification,
    
    // Modais
    openModal,
    closeModal,
    closeAllModals,
    
    // Loading
    setLoadingState,
    showPageLoading,
    hidePageLoading,
    
    // Validação
    validateField,
    validateForm,
    
    // Utilities
    debounce,
    throttle,
    isValidEmail
};

// Log da inicialização
console.log('✅ GSLearning base.js carregado com sucesso!');