// GSLEARNING - static/js/training-player.js
// JavaScript para player de treinamento com sistema anti-burla

document.addEventListener('DOMContentLoaded', function() {
    initializeTrainingPlayer();
});

function initializeTrainingPlayer() {
    const video = document.getElementById('trainingVideo');
    if (!video) return;
    
    // Configuração inicial
    const playerState = {
        moduleId: video.dataset.moduleId,
        duration: parseInt(video.dataset.duration) || 0,
        validWatchTime: 0,
        isTabActive: true,
        isVideoPlaying: false,
        lastUpdateTime: 0,
        updateInterval: null,
        wasCompleted: false, // ADICIONADO: para evitar múltiplas mensagens
        progressUpdateUrl: `/training/api/progress/${video.dataset.moduleId}/`
    };
    
    // Elementos da interface
    const elements = {
        video: video,
        statusOverlay: document.getElementById('statusOverlay'),
        statusIcon: document.getElementById('statusIcon'),
        statusText: document.getElementById('statusText'),
        statusSubtext: document.getElementById('statusSubtext'),
        currentTime: document.getElementById('currentTime'),
        totalTime: document.getElementById('totalTime'),
        statusIndicator: document.getElementById('statusIndicator'),
        statusLabel: document.getElementById('statusLabel'),
        progressFill: document.getElementById('progressFill'),
        completionPercentage: document.getElementById('completionPercentage'),
        
        // Status dots
        tabStatus: document.getElementById('tabStatus'),
        tabStatusText: document.getElementById('tabStatusText'),
        videoStatus: document.getElementById('videoStatus'),
        videoStatusText: document.getElementById('videoStatusText'),
        timeStatus: document.getElementById('timeStatus'),
        timeStatusText: document.getElementById('timeStatusText'),
        progressStatus: document.getElementById('progressStatus'),
        progressStatusText: document.getElementById('progressStatusText')
    };
    
    // Inicializar player
    setupVideoEvents();
    setupTabDetection();
    setupProgressTracking();
    setupAntiCheatMeasures();
    updateInterface();
    
    /**
     * ===== EVENTOS DO VÍDEO =====
     */
    function setupVideoEvents() {
        // Quando o vídeo carrega
        video.addEventListener('loadedmetadata', function() {
            const duration = Math.floor(video.duration);
            playerState.duration = duration;
            elements.totalTime.textContent = formatTime(duration);
            updateStatusDisplay('ready', 'Vídeo carregado', 'Pressione play para iniciar');
            showOverlay(); // Mostrar overlay inicialmente
        });
        
        // Quando o usuário clica no vídeo para dar play
        video.addEventListener('click', function() {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
        
        // Quando inicia
        video.addEventListener('play', function() {
            playerState.isVideoPlaying = true;
            playerState.lastUpdateTime = Date.now();
            startProgressTracking();
            updateStatusDisplay('playing', 'Reproduzindo', 'Progresso sendo contabilizado');
            hideOverlay();
        });
        
        // Quando pausa
        video.addEventListener('pause', function() {
            playerState.isVideoPlaying = false;
            stopProgressTracking();
            updateStatusDisplay('paused', 'Pausado', 'Clique em play para continuar');
            showOverlay();
        });
        
        // Atualizações de tempo
        video.addEventListener('timeupdate', function() {
            elements.currentTime.textContent = formatTime(Math.floor(video.currentTime));
            updateTimeStatus();
        });
        
        // Quando termina
        video.addEventListener('ended', function() {
            playerState.isVideoPlaying = false;
            stopProgressTracking();
            checkCompletion();
        });
        
        // Prevenir clique direito
        video.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    }
    
    /**
     * ===== DETECÇÃO DE ABA ATIVA =====
     */
    function setupTabDetection() {
        // Detecção de mudança de aba
        document.addEventListener('visibilitychange', function() {
            playerState.isTabActive = !document.hidden;
            updateTabStatus();
            
            if (!playerState.isTabActive && playerState.isVideoPlaying) {
                updateStatusDisplay('inactive', 'Aba inativa', 'Volte para esta aba para continuar');
            } else if (playerState.isTabActive && playerState.isVideoPlaying) {
                updateStatusDisplay('playing', 'Reproduzindo', 'Progresso sendo contabilizado');
            }
        });
        
        // Detecção de foco na janela
        window.addEventListener('focus', function() {
            playerState.isTabActive = true;
            updateTabStatus();
        });
        
        window.addEventListener('blur', function() {
            playerState.isTabActive = false;
            updateTabStatus();
        });
    }
    
    /**
     * ===== TRACKING DE PROGRESSO =====
     */
    function setupProgressTracking() {
        // Não precisa de setup especial, apenas inicializar
        updateProgressStatus();
    }
    
    function startProgressTracking() {
        stopProgressTracking(); // Limpar interval anterior
        
        playerState.updateInterval = setInterval(function() {
            if (isValidWatchCondition()) {
                playerState.validWatchTime += 1; // +1 segundo
                updateProgressDisplay();
                
                // Salvar progresso a cada 10 segundos
                if (playerState.validWatchTime % 10 === 0) {
                    saveProgress();
                }
            }
        }, 1000); // A cada segundo
    }
    
    function stopProgressTracking() {
        if (playerState.updateInterval) {
            clearInterval(playerState.updateInterval);
            playerState.updateInterval = null;
        }
    }
    
    function isValidWatchCondition() {
        return playerState.isTabActive && 
               playerState.isVideoPlaying && 
               !video.paused;
    }
    
    /**
     * ===== MEDIDAS ANTI-BURLA =====
     */
    function setupAntiCheatMeasures() {
        // Desabilitar teclas perigosas
        document.addEventListener('keydown', function(e) {
            // F12, Ctrl+Shift+I (DevTools)
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C')) {
                e.preventDefault();
                showWarning('Ferramentas de desenvolvedor não são permitidas durante o treinamento');
                return false;
            }
        });
        
        // Detectar tentativa de acelerar vídeo
        video.addEventListener('ratechange', function() {
            if (video.playbackRate !== 1.0) {
                video.playbackRate = 1.0;
                showWarning('Não é permitido alterar a velocidade do vídeo');
            }
        });
        
        // Detectar tentativa de pular partes
        let lastCurrentTime = 0;
        video.addEventListener('timeupdate', function() {
            const timeDiff = video.currentTime - lastCurrentTime;
            
            // Se avançou mais que 3 segundos de uma vez (possível pulo)
            if (timeDiff > 3 && lastCurrentTime > 0) {
                showWarning('Detectado avanço rápido. Assista ao conteúdo na sequência');
            }
            
            lastCurrentTime = video.currentTime;
        });
    }
    
    /**
     * ===== ATUALIZAÇÕES DE INTERFACE =====
     */
    function updateInterface() {
        updateTabStatus();
        updateVideoStatus();
        updateTimeStatus();
        updateProgressStatus();
    }
    
    function updateStatusDisplay(status, text, subtext) {
        if (!elements.statusIndicator) return;
        
        elements.statusIndicator.className = `status-indicator ${status}`;
        if (elements.statusLabel) elements.statusLabel.textContent = text;
        if (elements.statusText) elements.statusText.textContent = text;
        if (elements.statusSubtext) elements.statusSubtext.textContent = subtext;
        
        // Atualizar ícone
        if (elements.statusIcon) {
            const icons = {
                ready: 'fas fa-play',
                playing: 'fas fa-pause',
                paused: 'fas fa-play',
                inactive: 'fas fa-exclamation-triangle',
                completed: 'fas fa-check-circle'
            };
            elements.statusIcon.className = icons[status] || 'fas fa-play';
        }
    }
    
    function updateTabStatus() {
        if (!elements.tabStatus) return;
        
        if (playerState.isTabActive) {
            elements.tabStatus.className = 'status-dot-mini active';
            elements.tabStatusText.textContent = 'Ativa';
        } else {
            elements.tabStatus.className = 'status-dot-mini inactive';
            elements.tabStatusText.textContent = 'Inativa';
        }
    }
    
    function updateVideoStatus() {
        if (!elements.videoStatus) return;
        
        if (playerState.isVideoPlaying && !video.paused) {
            elements.videoStatus.className = 'status-dot-mini playing';
            elements.videoStatusText.textContent = 'Reproduzindo';
        } else {
            elements.videoStatus.className = 'status-dot-mini ready';
            elements.videoStatusText.textContent = 'Pausado';
        }
    }
    
    function updateTimeStatus() {
        if (!elements.timeStatus) return;
        
        elements.timeStatusText.textContent = formatTime(playerState.validWatchTime);
        
        if (playerState.validWatchTime > 0) {
            elements.timeStatus.className = 'status-dot-mini active';
        } else {
            elements.timeStatus.className = 'status-dot-mini ready';
        }
    }
    
    function updateProgressStatus() {
        if (!elements.progressStatus) return;
        
        const completionPercentage = calculateCompletionPercentage();
        
        if (completionPercentage >= 95) {
            elements.progressStatus.className = 'status-dot-mini active';
            elements.progressStatusText.textContent = 'Módulo concluído!';
        } else {
            elements.progressStatus.className = 'status-dot-mini ready';
            elements.progressStatusText.textContent = `95% para aprovação`;
        }
    }
    
    function updateProgressDisplay() {
        const completionPercentage = calculateCompletionPercentage();
        
        // Atualizar barra de progresso
        if (elements.progressFill) {
            elements.progressFill.style.width = completionPercentage + '%';
            
            if (completionPercentage >= 95) {
                elements.progressFill.classList.add('completed');
            }
        }
        
        // Atualizar porcentagem
        if (elements.completionPercentage) {
            elements.completionPercentage.textContent = Math.floor(completionPercentage) + '%';
        }
        
        updateTimeStatus();
        updateProgressStatus();
    }
    
    /**
     * ===== CÁLCULOS =====
     */
    function calculateCompletionPercentage() {
        if (playerState.duration === 0) return 0;
        return Math.min((playerState.validWatchTime / playerState.duration) * 100, 100);
    }
    
    function checkCompletion() {
        const completionPercentage = calculateCompletionPercentage();
        
        if (completionPercentage >= 95 && !playerState.wasCompleted) {
            updateStatusDisplay('completed', 'Módulo Concluído!', 'Parabéns! Você completou este treinamento');
            showCompletionCelebration();
            saveProgress(true); // Marcar como completo
            playerState.wasCompleted = true; // Evitar múltiplas execuções
        } else if (completionPercentage < 95) {
            const remaining = 95 - Math.floor(completionPercentage);
            updateStatusDisplay('paused', 'Quase lá!', `Você precisa assistir ${remaining}% a mais para concluir`);
        }
    }
    
    /**
     * ===== EFEITOS VISUAIS =====
     */
    function showOverlay() {
        if (elements.statusOverlay) {
            elements.statusOverlay.classList.remove('hidden');
            elements.statusOverlay.classList.add('visible');
        }
    }
    
    function hideOverlay() {
        if (elements.statusOverlay) {
            elements.statusOverlay.classList.add('hidden');
            elements.statusOverlay.classList.remove('visible');
        }
    }
    
    function showCompletionCelebration() {
        const celebration = document.createElement('div');
        celebration.className = 'completion-celebration';
        elements.video.parentElement.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 800);
        
        // Confete effect (simples)
        createConfetti();
    }
    
    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: hsl(${Math.random() * 360}, 70%, 60%);
                    top: -10px;
                    left: ${Math.random() * 100}%;
                    z-index: 1000;
                    animation: confettiFall 3s linear forwards;
                `;
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 100);
        }
    }
    
    function showWarning(message) {
        // Criar alerta visual simples
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fef2f2;
            border: 1px solid #ef4444;
            color: #991b1b;
            padding: 1rem;
            border-radius: 0.5rem;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        `;
        warning.textContent = message;
        document.body.appendChild(warning);
        
        setTimeout(() => warning.remove(), 5000);
    }
    
    /**
     * ===== COMUNICAÇÃO COM SERVIDOR =====
     */
    function saveProgress(isCompleted = false) {
        const data = {
            current_time: Math.floor(video.currentTime),
            total_watch_time: playerState.validWatchTime,
            completion_percentage: calculateCompletionPercentage(),
            is_completed: isCompleted
        };
        
        // Usar a API que já existe no backend
        fetch(playerState.progressUpdateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Progresso salvo:', data);
                
                // Se completou, mostrar mensagem
                if (data.is_completed && !playerState.wasCompleted) {
                    playerState.wasCompleted = true;
                    showCompletionMessage();
                }
            } else {
                console.error('❌ Erro ao salvar:', data.error);
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição:', error);
            // Não quebrar a interface se der erro
        });
    }
    
    function showCompletionMessage() {
        // Mensagem de sucesso simples
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 2rem;
            border-radius: 1rem;
            text-align: center;
            z-index: 2000;
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
            max-width: 400px;
        `;
        message.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
            <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">Módulo Concluído!</h3>
            <p style="margin-bottom: 1rem;">Parabéns! Você completou este treinamento com sucesso.</p>
            <button onclick="this.parentElement.remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer;">
                Continuar
            </button>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remover após 10 segundos
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 10000);
        
        // Criar confete
        createConfetti();
    }
    
    function getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
    }
    
    /**
     * ===== UTILITIES =====
     */
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * ===== API PÚBLICA =====
     */
    window.TrainingPlayer = {
        getState: () => playerState,
        updateProgress: updateProgressDisplay,
        saveProgress: () => saveProgress(),
        checkCompletion: checkCompletion
    };
}

// CSS para animações dinâmicas
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(dynamicStyles);