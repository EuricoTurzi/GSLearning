// GSLEARNING - static/js/dashboard.js
// JavaScript específico para o dashboard do cliente

/**
 * ===== INICIALIZAÇÃO DO DASHBOARD =====
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 GSLearning Dashboard Cliente - Inicializando...');
    
    // Inicializar funcionalidades principais
    initializeDashboard();
    initializeAnimations();
    initializeProgressBars();
    initializeClientCards();
    initializeEquipmentCards();
    initializeActivityTimeline();
    initializeInteractions();
    initializeClientFeatures();
    
    console.log('✅ Dashboard do cliente configurado com sucesso!');
});

/**
 * ===== INICIALIZAÇÃO GERAL =====
 */
function initializeDashboard() {
    // Loading states
    setupLoadingStates();
    
    // Tooltips para elementos do dashboard
    setupDashboardTooltips();
    
    // Keyboard shortcuts
    setupClientShortcuts();
    
    // Auto-refresh opcional (desabilitado por padrão)
    setupAutoRefresh();
}

/**
 * ===== ANIMAÇÕES DO DASHBOARD =====
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
    // Animar cards principais
    const clientCards = document.querySelectorAll('.dashboard-client-card');
    clientCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    // Animar cards de equipamento
    const equipmentCards = document.querySelectorAll('.equipment-card');
    equipmentCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 150));
    });
    
    // Animar timeline
    const timelineItems = document.querySelectorAll('.activity-timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.4s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 500 + (index * 100));
    });
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Animar barras de progresso quando visíveis
                if (entry.target.classList.contains('progress-bar-mini') || 
                    entry.target.classList.contains('progress-bar-xs') ||
                    entry.target.classList.contains('progress-mini')) {
                    animateProgressBar(entry.target);
                }
                
                // Animar números dos cards
                if (entry.target.classList.contains('card-number')) {
                    animateNumber(entry.target);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    // Observar elementos relevantes
    document.querySelectorAll('.progress-bar-mini, .progress-bar-xs, .progress-mini, .card-number, .equipment-card').forEach(el => {
        observer.observe(el);
    });
}

function setupHoverEffects() {
    // Hover effects para cards principais
    const clientCards = document.querySelectorAll('.dashboard-client-card');
    clientCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Hover effects para cards de equipamento
    const equipmentCards = document.querySelectorAll('.equipment-card');
    equipmentCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-6px)';
            this.style.transition = 'all 0.3s ease';
            
            // Animar ícone do equipamento
            const icon = this.querySelector('.equipment-image i');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.transition = 'all 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            
            const icon = this.querySelector('.equipment-image i');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
    
    // Ripple effect para botões
    const actionBtns = document.querySelectorAll('.card-action, .equipment-action');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            createRippleEffect(e, this);
        });
    });
}

function setupMicroAnimations() {
    // Animar ícones dos cards na entrada
    const cardIcons = document.querySelectorAll('.card-icon i');
    cardIcons.forEach((icon, index) => {
        setTimeout(() => {
            icon.style.animation = 'iconBounce 0.6s ease-out';
        }, 200 + (index * 100));
    });
    
    // Pulsar marcadores da timeline
    const timelineMarkers = document.querySelectorAll('.activity-timeline-marker');
    timelineMarkers.forEach((marker, index) => {
        setTimeout(() => {
            marker.style.animation = 'markerPulse 2s ease-in-out infinite';
        }, 800 + (index * 200));
    });
}

function createRippleEffect(event, element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    ripple.className = 'ripple-effect';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * ===== BARRAS DE PROGRESSO =====
 */
function initializeProgressBars() {
    // Animar todas as barras de progresso após um delay
    setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress-mini, .progress-bar-mini, .progress-bar-xs');
        progressBars.forEach((bar, index) => {
            setTimeout(() => {
                animateProgressBar(bar);
            }, index * 200);
        });
    }, 1000);
}

function animateProgressBar(progressContainer) {
    const progressFill = progressContainer.querySelector('.progress-mini-fill, .progress-fill-mini, .progress-fill-xs');
    
    if (progressFill) {
        const targetWidth = progressFill.style.width || '0%';
        
        // Começar do zero
        progressFill.style.width = '0%';
        
        // Animar para o valor target
        setTimeout(() => {
            progressFill.style.transition = 'width 1s ease-out';
            progressFill.style.width = targetWidth;
        }, 100);
        
        // Adicionar efeito de brilho
        setTimeout(() => {
            progressFill.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';
        }, 600);
    }
}

function animateNumber(numberElement) {
    const targetNumber = parseInt(numberElement.textContent) || 0;
    
    if (targetNumber > 0) {
        let currentNumber = 0;
        const increment = targetNumber / 30; // 30 frames de animação
        
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
            
            numberElement.textContent = Math.floor(currentNumber);
        }, 50);
    }
}

/**
 * ===== CARDS PRINCIPAIS =====
 */
function initializeClientCards() {
    const clientCards = document.querySelectorAll('.dashboard-client-card');
    
    clientCards.forEach(card => {
        // Adicionar indicador de loading se necessário
        setupCardLoading(card);
        
        // Click tracking
        card.addEventListener('click', function() {
            trackCardClick(this);
        });
        
        // Adicionar micro-animações
        setupCardMicroAnimations(card);
    });
}

function setupCardLoading(card) {
    const number = card.querySelector('.card-number');
    
    if (number && (number.textContent.trim() === '0' || number.textContent.trim() === '')) {
        card.classList.add('loading-card');
        
        setTimeout(() => {
            card.classList.remove('loading-card');
        }, 1500);
    }
}

function trackCardClick(card) {
    const cardTitle = card.querySelector('.card-title')?.textContent;
    console.log(`📊 Card clicado: ${cardTitle}`);
    
    // Feedback visual
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
        card.style.transform = '';
    }, 150);
}

function setupCardMicroAnimations(card) {
    // Bounce sutil no hover
    card.addEventListener('mouseenter', function() {
        this.style.animation = 'cardBounce 0.3s ease-out';
    });
    
    card.addEventListener('animationend', function() {
        this.style.animation = '';
    });
}

/**
 * ===== CARDS DE EQUIPAMENTO =====
 */
function initializeEquipmentCards() {
    const equipmentCards = document.querySelectorAll('.equipment-card');
    
    equipmentCards.forEach(card => {
        // Animar entrada com delay
        setupEquipmentCardAnimation(card);
        
        // Hover effects especiais
        setupEquipmentHoverEffects(card);
        
        // Click interactions
        setupEquipmentClickEffects(card);
    });
}

function setupEquipmentCardAnimation(card) {
    // Observar quando o card entra na tela
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('equipment-card-animate');
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(card);
}

function setupEquipmentHoverEffects(card) {
    const image = card.querySelector('.equipment-image img, .equipment-image div');
    const progressBar = card.querySelector('.progress-fill-mini');
    
    card.addEventListener('mouseenter', function() {
        // Efeito na imagem
        if (image) {
            image.style.transform = 'scale(1.1)';
            image.style.filter = 'brightness(1.1)';
        }
        
        // Animar barra de progresso
        if (progressBar) {
            progressBar.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.8)';
        }
        
        // Efeito no conteúdo
        const content = this.querySelector('.equipment-content');
        if (content) {
            content.style.background = 'linear-gradient(135deg, #1e40af, #3730a3)';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        if (image) {
            image.style.transform = 'scale(1)';
            image.style.filter = 'brightness(1)';
        }
        
        if (progressBar) {
            progressBar.style.boxShadow = '';
        }
        
        const content = this.querySelector('.equipment-content');
        if (content) {
            content.style.background = 'linear-gradient(135deg, #1f2937, #374151)';
        }
    });
}

function setupEquipmentClickEffects(card) {
    card.addEventListener('click', function(e) {
        // Se não clicou no botão, não fazer nada
        if (!e.target.closest('.equipment-action')) {
            return;
        }
        
        console.log('🎯 Equipamento clicado:', this.querySelector('.equipment-title')?.textContent);
        
        // Efeito visual de clique
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
    });
}

/**
 * ===== TIMELINE DE ATIVIDADES =====
 */
function initializeActivityTimeline() {
    const timelineItems = document.querySelectorAll('.activity-timeline-item');
    
    // Animar entrada sequencial
    timelineItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 600 + (index * 150));
    });
    
    // Hover effects para timeline
    setupTimelineHoverEffects();
    
    // Auto-refresh da timeline
    setupTimelineAutoRefresh();
}

function setupTimelineHoverEffects() {
    const timelineItems = document.querySelectorAll('.activity-timeline-item');
    
    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8fafc';
            this.style.borderRadius = '0.5rem';
            this.style.transform = 'translateX(5px)';
            this.style.padding = '1rem 1rem 1rem 0';
            
            // Animar marcador
            const marker = this.querySelector('.activity-timeline-marker');
            if (marker) {
                marker.style.transform = 'scale(1.3)';
                marker.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.5)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
            this.style.borderRadius = '';
            this.style.transform = 'translateX(0)';
            this.style.padding = '1rem 0';
            
            const marker = this.querySelector('.activity-timeline-marker');
            if (marker) {
                marker.style.transform = 'scale(1)';
                marker.style.boxShadow = '';
            }
        });
    });
}

function setupTimelineAutoRefresh() {
    // Verificar por novas atividades a cada 30 segundos
    setInterval(() => {
        checkForNewActivities();
    }, 30000);
}

function checkForNewActivities() {
    console.log('🔄 Verificando novas atividades...');
    
    // Simular nova atividade ocasionalmente (10% de chance)
    if (Math.random() < 0.1) {
        addNewActivityNotification();
    }
}

function addNewActivityNotification() {
    const timelineSection = document.querySelector('.activity-timeline-item')?.parentElement;
    
    if (timelineSection) {
        const notification = document.createElement('div');
        notification.className = 'new-activity-notification';
        notification.innerHTML = `
            <i class="fas fa-bell text-blue-500"></i>
            <span>Nova atividade disponível</span>
            <button onclick="this.parentElement.remove()" class="close-btn">×</button>
        `;
        
        timelineSection.insertBefore(notification, timelineSection.firstChild);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

/**
 * ===== INTERAÇÕES GERAIS =====
 */
function initializeInteractions() {
    // Smooth scroll para links internos
    setupSmoothScroll();
    
    // Click tracking para botões de ação
    setupActionButtonTracking();
    
    // Feedback visual para interações
    setupInteractionFeedback();
    
    // Confirmações para ações importantes
    setupActionConfirmations();
}

function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupActionButtonTracking() {
    const actionBtns = document.querySelectorAll('.card-action, .equipment-action');
    
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            console.log(`🎯 Ação executada: ${action}`);
            
            // Feedback visual
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

function setupInteractionFeedback() {
    // Feedback visual para cliques
    document.addEventListener('click', function(e) {
        if (e.target.matches('button, .card-action, .equipment-action, .nav-link')) {
            showClickFeedback(e);
        }
    });
}

function showClickFeedback(event) {
    const feedback = document.createElement('div');
    feedback.className = 'click-feedback';
    feedback.style.left = event.clientX + 'px';
    feedback.style.top = event.clientY + 'px';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 300);
}

function setupActionConfirmations() {
    // Adicionar confirmações para ações importantes (se necessário)
    const criticalActions = document.querySelectorAll('[data-confirm]');
    
    criticalActions.forEach(action => {
        action.addEventListener('click', function(e) {
            const message = this.dataset.confirm;
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });
}

/**
 * ===== FUNCIONALIDADES DO CLIENTE =====
 */
function initializeClientFeatures() {
    console.log('👤 Inicializando funcionalidades de cliente...');
    
    // Progresso motivacional
    setupMotivationalFeatures();
    
    // Navegação rápida
    setupQuickNavigation();
    
    // Dicas e ajuda
    setupHelpSystem();
    
    // Celebrar conquistas
    setupAchievementSystem();
}

function setupMotivationalFeatures() {
    // Verificar progresso e mostrar mensagens motivacionais
    checkForProgress();
    
    // Mensagens motivacionais periódicas
    setTimeout(() => {
        showMotivationalMessages();
    }, 10000);
    
    // Progresso visual aprimorado
    enhanceProgressDisplay();
}

function checkForProgress() {
    const progressElements = document.querySelectorAll('.card-number');
    let totalProgress = 0;
    
    progressElements.forEach(el => {
        const value = parseInt(el.textContent) || 0;
        totalProgress += value;
    });
    
    if (totalProgress > 0) {
        setTimeout(() => {
            showNotification('Continue assim! Você está progredindo! 🚀', 'success');
        }, 3000);
    }
}

function showMotivationalMessages() {
    const messages = [
        'Cada passo conta na sua jornada de aprendizado! 📚',
        'Você está mais próximo da sua certificação! 🏆',
        'Continue praticando - a excelência vem com a persistência! ⭐',
        'Seu progresso é inspirador! Continue assim! 🌟',
        'Aprender nunca foi tão recompensador! 🎯'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    setTimeout(() => {
        showNotification(randomMessage, 'info', 6000);
    }, Math.random() * 20000 + 10000); // Entre 10-30 segundos
}

function enhanceProgressDisplay() {
    const progressBars = document.querySelectorAll('.progress-mini-fill, .progress-fill-mini, .progress-fill-xs');
    
    progressBars.forEach(bar => {
        const percentage = parseInt(bar.style.width) || 0;
        
        if (percentage > 0) {
            bar.style.animation = 'progressGlow 2s ease-in-out infinite alternate';
        }
        
        // Adicionar indicador de porcentagem ao hover
        bar.parentElement.addEventListener('mouseenter', function() {
            showProgressTooltip(this, percentage + '%');
        });
        
        bar.parentElement.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function setupAchievementSystem() {
    // Verificar conquistas baseadas no progresso
    const certificates = parseInt(document.querySelector('.dashboard-client-card.warning .card-number')?.textContent) || 0;
    const progress = parseInt(document.querySelector('.dashboard-client-card.success .card-number')?.textContent) || 0;
    
    // Primeira certificação
    if (certificates === 1) {
        setTimeout(() => {
            showAchievement('🏆 Primeira Certificação!', 'Parabéns pelo seu primeiro certificado!');
        }, 2000);
    }
    
    // Progresso significativo
    if (progress >= 50 && progress < 100) {
        setTimeout(() => {
            showAchievement('⚡ Meio Caminho!', 'Você já completou mais da metade!');
        }, 4000);
    }
    
    // Conclusão total
    if (progress === 100) {
        setTimeout(() => {
            showAchievement('🌟 Mestre Completo!', 'Todos os treinamentos concluídos!');
        }, 1000);
    }
}

function showAchievement(title, message) {
    const achievement = document.createElement('div');
    achievement.className = 'achievement-popup';
    achievement.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-icon">🎉</div>
            <div class="achievement-text">
                <div class="achievement-title">${title}</div>
                <div class="achievement-message">${message}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="achievement-close">×</button>
        </div>
    `;
    
    document.body.appendChild(achievement);
    
    setTimeout(() => {
        achievement.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        achievement.classList.remove('show');
        setTimeout(() => {
            if (achievement.parentElement) {
                achievement.remove();
            }
        }, 300);
    }, 5000);
}

function setupQuickNavigation() {
    // Atalhos de teclado para navegação
    document.addEventListener('keydown', function(e) {
        // E para equipamentos
        if (e.key === 'e' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const equipmentLink = document.querySelector('a[href*="equipment"]');
            if (equipmentLink && !isInputFocused()) {
                equipmentLink.click();
            }
        }
        
        // C para certificados
        if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const certificateLink = document.querySelector('a[href*="certificate"]');
            if (certificateLink && !isInputFocused()) {
                certificateLink.click();
            }
        }
    });
}

function isInputFocused() {
    return document.activeElement.tagName === 'INPUT' || 
           document.activeElement.tagName === 'TEXTAREA' ||
           document.activeElement.contentEditable === 'true';
}

function setupHelpSystem() {
    // Adicionar tooltips informativos
    const helpElements = [
        { selector: '.card-number', text: 'Este é seu progresso atual nos treinamentos' },
        { selector: '.equipment-card', text: 'Clique para acessar o treinamento deste equipamento' },
        { selector: '.progress-bar-mini', text: 'Barra de progresso - mostra quanto você já completou' },
        { selector: '.activity-timeline-marker', text: 'Marcador de atividade - cores indicam o status' }
    ];
    
    helpElements.forEach(({ selector, text }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.setAttribute('data-tooltip', text);
            el.setAttribute('data-tooltip-position', 'top');
        });
    });
}

/**
 * ===== CONFIGURAÇÕES GERAIS =====
 */
function setupAutoRefresh() {
    // Auto-refresh opcional (desabilitado por padrão)
    const autoRefresh = localStorage.getItem('dashboard_auto_refresh') === 'true';
    
    if (autoRefresh) {
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                // Atualizar apenas dados específicos sem recarregar página
                updateDashboardData();
            }
        }, 5 * 60 * 1000); // 5 minutos
    }
}

function updateDashboardData() {
    console.log('🔄 Atualizando dados do dashboard...');
    // Aqui você faria uma requisição AJAX para atualizar os dados
}

function setupLoadingStates() {
    // Adicionar loading states para elementos que precisam carregar dados
    const loadingElements = document.querySelectorAll('[data-loading]');
    
    loadingElements.forEach(el => {
        el.classList.add('loading');
        
        setTimeout(() => {
            el.classList.remove('loading');
        }, 2000);
    });
}

function setupDashboardTooltips() {
    // Tooltips para elementos com data-tooltip
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            showTooltip(this, this.dataset.tooltip);
        });
        
        el.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'dashboard-tooltip';
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
    
    setTimeout(() => {
        tooltip.classList.add('show');
    }, 10);
}

function showProgressTooltip(element, text) {
    showTooltip(element, `Progresso: ${text}`);
}

function hideTooltip() {
    const tooltip = document.querySelector('.dashboard-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function setupClientShortcuts() {
    document.addEventListener('keydown', function(e) {
        // ? para ajuda
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
            showDashboardHelp();
        }
        
        // F5 ou Ctrl+R para refresh (com confirmação)
        if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
            if (confirm('Recarregar o dashboard? Isso pode interromper ações em andamento.')) {
                return true; // Permitir refresh
            } else {
                e.preventDefault();
            }
        }
    });
}

function showDashboardHelp() {
    const helpText = `
🚀 ATALHOS DO DASHBOARD:

Navegação:
• E - Ir para equipamentos
• C - Ir para certificados
• ? - Mostrar esta ajuda
• F5 - Recarregar dashboard

💡 Dicas:
• Passe o mouse sobre os elementos para ver tooltips
• As barras de progresso são animadas automaticamente
• Clique nos cards para navegar rapidamente

🎯 Funcionalidades:
• Progresso salvo automaticamente
• Notificações motivacionais
• Animações suaves e responsivas
    `;
    
    alert(helpText);
}

/**
 * ===== UTILITIES =====
 */
function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `dashboard-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }
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

/**
 * ===== API PÚBLICA DO DASHBOARD =====
 */
window.GSLearningDashboard = {
    // Animações
    animateProgressBar,
    animateNumber,
    
    // Notificações
    showNotification,
    showAchievement,
    
    // Tooltips
    showTooltip,
    hideTooltip,
    
    // Utilities
    updateDashboardData,
    checkForProgress,
    
    // Estado
    getUserType: () => 'client'
};

/**
 * ===== ESTILOS CSS DINÂMICOS =====
 */
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes iconBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2) rotate(5deg); }
    }
    
    @keyframes markerPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }
    
    @keyframes cardBounce {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-2px) scale(1.01); }
    }
    
    .equipment-card-animate {
        animation: equipmentSlideIn 0.8s ease-out;
    }
    
    @keyframes equipmentSlideIn {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    .new-activity-notification {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: #eff6ff;
        border: 1px solid #3b82f6;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .click-feedback {
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%) scale(0);
        animation: clickFeedback 0.3s ease-out;
        z-index: 9999;
    }
    
    @keyframes clickFeedback {
        to {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
        }
    }
    
    .dashboard-tooltip {
        position: absolute;
        background: #1f2937;
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.8125rem;
        font-weight: 500;
        max-width: 200px;
        text-align: center;
        z-index: 1000;
        opacity: 0;
        transform: translateY(5px);
        transition: all 0.2s ease;
        pointer-events: none;
    }
    
    .dashboard-tooltip.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .dashboard-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: #1f2937;
    }
    
    .dashboard-notification {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1000;
        max-width: 300px;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    }
    
    .dashboard-notification.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .dashboard-notification.info {
        background: #eff6ff;
        border-left: 4px solid #3b82f6;
        color: #1e40af;
    }
    
    .dashboard-notification.success {
        background: #f0fdf4;
        border-left: 4px solid #10b981;
        color: #065f46;
    }
    
    .dashboard-notification.warning {
        background: #fffbeb;
        border-left: 4px solid #f59e0b;
        color: #92400e;
    }
    
    .dashboard-notification.error {
        background: #fef2f2;
        border-left: 4px solid #ef4444;
        color: #991b1b;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
    }
    
    .notification-content i {
        flex-shrink: 0;
    }
    
    .notification-content span {
        flex: 1;
        font-size: 0.875rem;
        font-weight: 500;
    }
    
    .notification-content button {
        background: none;
        border: none;
        color: currentColor;
        opacity: 0.5;
        cursor: pointer;
        font-size: 1.125rem;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .notification-content button:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.1);
    }
    
    .achievement-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        z-index: 2000;
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .achievement-popup.show {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
    
    .achievement-content {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 2rem;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
        min-width: 300px;
    }
    
    .achievement-icon {
        font-size: 2rem;
        animation: bounce 1s ease-in-out infinite;
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .achievement-title {
        font-size: 1.125rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }
    
    .achievement-message {
        font-size: 0.875rem;
        opacity: 0.9;
    }
    
    .achievement-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.25rem;
        padding: 0.25rem;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    
    .achievement-close:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    .close-btn {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        font-size: 1.125rem;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: color 0.2s ease;
    }
    
    .close-btn:hover {
        color: #374151;
        background: rgba(0, 0, 0, 0.05);
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease-out;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

document.head.appendChild(dashboardStyles);

console.log('✅ GSLearning dashboard.js do cliente carregado com sucesso!');