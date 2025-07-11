"""
Configuração do Django Admin para training

"""

# GSLEARNING - training/admin.py

from django.contrib import admin
from .models import TrainingModule, TrainingProgress, EquipmentTrainingProgress


@admin.register(TrainingModule)
class TrainingModuleAdmin(admin.ModelAdmin):
    """Admin para módulos de treinamento"""
    
    list_display = ('title', 'equipment', 'order', 'duration_formatted', 'is_active', 'created_at')
    list_filter = ('equipment__category', 'equipment', 'is_active', 'created_at')
    search_fields = ('title', 'description', 'equipment__name')
    ordering = ('equipment', 'order')
    
    fieldsets = (
        (None, {
            'fields': ('equipment', 'title', 'description', 'order', 'is_active')
        }),
        ('Arquivo', {
            'fields': ('video_file', 'duration_seconds')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TrainingProgress)
class TrainingProgressAdmin(admin.ModelAdmin):
    """Admin para progresso de treinamento"""
    
    list_display = ('client', 'module', 'status', 'completion_percentage', 'started_at', 'completed_at')
    list_filter = ('status', 'module__equipment', 'started_at', 'completed_at')
    search_fields = ('client__username', 'client__first_name', 'client__last_name', 'module__title')
    ordering = ('-updated_at',)
    
    fieldsets = (
        (None, {
            'fields': ('client', 'module', 'status')
        }),
        ('Progresso', {
            'fields': ('watch_time_seconds', 'completion_percentage', 'last_position_seconds', 'attempts')
        }),
        ('Timestamps', {
            'fields': ('started_at', 'completed_at', 'created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')


@admin.register(EquipmentTrainingProgress)
class EquipmentTrainingProgressAdmin(admin.ModelAdmin):
    """Admin para progresso geral por equipamento"""
    
    list_display = ('client', 'equipment', 'completion_percentage', 'started_at', 'completed_at')
    list_filter = ('equipment', 'completed_at')
    search_fields = ('client__username', 'equipment__name')
    ordering = ('-updated_at',)
    
    readonly_fields = ('created_at', 'updated_at')