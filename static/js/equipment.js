// GSLEARNING - static/js/equipment.js
// JavaScript para lista de equipamentos - VERSÃO ENXUTA

document.addEventListener('DOMContentLoaded', function() {
    initializeEquipmentList();
});

function initializeEquipmentList() {
    // Elementos principais
    const searchInput = document.getElementById('equipmentSearch');
    const categoryFilter = document.querySelector('[data-filter="category"]');
    const statusFilter = document.querySelector('[data-filter="status"]');
    const equipmentGrid = document.getElementById('equipmentGrid');
    const noResults = document.getElementById('noResults');
    
    if (!equipmentGrid) return;
    
    const cards = equipmentGrid.querySelectorAll('.equipment-card');
    
    // Busca em tempo real
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterCards();
        });
    }
    
    // Filtros
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterCards);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterCards);
    }
    
    // Animar barras de progresso
    setTimeout(() => {
        animateProgressBars();
    }, 500);
    
    // Função principal de filtro
    function filterCards() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        const selectedStatus = statusFilter ? statusFilter.value : 'all';
        
        let visibleCount = 0;
        
        cards.forEach(card => {
            const cardName = card.dataset.name || '';
            const cardCategory = card.dataset.category || '';
            const cardStatus = card.dataset.status || 'not_started';
            
            // Verificar condições
            const matchesSearch = !searchTerm || cardName.includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || cardCategory === selectedCategory;
            const matchesStatus = selectedStatus === 'all' || cardStatus === selectedStatus;
            
            // Mostrar/esconder card
            if (matchesSearch && matchesCategory && matchesStatus) {
                card.style.display = 'block';
                card.classList.remove('filtered-out');
                card.classList.add('filtered-in');
                visibleCount++;
            } else {
                card.classList.add('filtered-out');
                card.classList.remove('filtered-in');
                setTimeout(() => {
                    if (card.classList.contains('filtered-out')) {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });
        
        // Mostrar/esconder "sem resultados"
        if (noResults) {
            if (visibleCount === 0) {
                noResults.classList.remove('hidden');
            } else {
                noResults.classList.add('hidden');
            }
        }
    }
    
    // Animar barras de progresso
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        
        progressBars.forEach((bar, index) => {
            setTimeout(() => {
                const targetWidth = bar.style.width || '0%';
                bar.style.width = '0%';
                
                setTimeout(() => {
                    bar.style.width = targetWidth;
                }, 100);
            }, index * 100);
        });
    }
    
    // Hover effects para cards
    cards.forEach(card => {
        const progressBar = card.querySelector('.progress-fill');
        
        card.addEventListener('mouseenter', function() {
            if (progressBar) {
                progressBar.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.8)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (progressBar) {
                progressBar.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';
            }
        });
    });
    
    // Ripple effect nos botões
    const actionButtons = document.querySelectorAll('.equipment-action');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.3)';
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

// CSS para animação ripple
const rippleCSS = document.createElement('style');
rippleCSS.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .equipment-action {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(rippleCSS);