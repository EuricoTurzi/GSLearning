# GSLEARNING - equipment/templatetags/equipment_extras.py
# Template tags para calcular progresso

from django import template
from training.models import TrainingModule, TrainingProgress

register = template.Library()

@register.filter
def equipment_progress(equipment, user):
    """Calcula progresso do equipamento para o usuário"""
    if not user or not user.is_authenticated:
        return 0
    
    total_modules = TrainingModule.objects.filter(
        equipment=equipment, 
        is_active=True
    ).count()
    
    if total_modules == 0:
        return 0
    
    completed_modules = TrainingProgress.objects.filter(
        client=user,
        module__equipment=equipment,
        status='completed'
    ).count()
    
    return round((completed_modules / total_modules) * 100)

@register.filter  
def equipment_total_modules(equipment):
    """Total de módulos do equipamento"""
    return TrainingModule.objects.filter(
        equipment=equipment, 
        is_active=True
    ).count()

@register.filter
def equipment_completed_modules(equipment, user):
    """Módulos concluídos pelo usuário"""
    if not user or not user.is_authenticated:
        return 0
        
    return TrainingProgress.objects.filter(
        client=user,
        module__equipment=equipment,
        status='completed'
    ).count()

@register.filter
def equipment_status(equipment, user):
    """Status do equipamento para o usuário"""
    progress = equipment_progress(equipment, user)
    
    if progress >= 100:
        return 'completed'
    elif progress > 0:
        return 'in_progress'
    else:
        return 'not_started'