"""
Configuração do Django Admin para accounts
"""

# GSLEARNING - accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ClientProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin para o modelo User customizado"""
    
    # Campos exibidos na lista
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'company', 'is_active_client', 'is_active')
    list_filter = ('user_type', 'is_active', 'is_active_client', 'is_staff', 'is_superuser')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'company')
    
    # Campos editáveis
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informações Adicionais', {
            'fields': ('user_type', 'company', 'phone', 'is_active_client', 'last_access')
        }),
    )
    
    # Campos para criação de novo usuário
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Informações Adicionais', {
            'fields': ('user_type', 'company', 'phone', 'email', 'first_name', 'last_name')
        }),
    )
    
    readonly_fields = ('last_access', 'created_at')


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    """Admin para perfis de cliente"""
    
    list_display = ('user', 'contact_person', 'registration_completed')
    list_filter = ('registration_completed',)
    search_fields = ('user__username', 'user__company', 'contact_person')
    
    fieldsets = (
        (None, {
            'fields': ('user', 'contact_person', 'notes', 'registration_completed')
        }),
    )