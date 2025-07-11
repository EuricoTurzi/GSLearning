"""
Models para o sistema de contas/usuários
"""

# GSLEARNING - accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Modelo de usuário customizado para a plataforma
    """
    USER_TYPE_CHOICES = [
        ('admin', 'Administrador'),
        ('client', 'Cliente'),
    ]
    
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='client',
        verbose_name='Tipo de Usuário'
    )
    
    company = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Empresa'
    )
    
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Telefone'
    )
    
    is_active_client = models.BooleanField(
        default=True,
        verbose_name='Cliente Ativo'
    )
    
    is_first_login = models.BooleanField(
        default=True,
        verbose_name='Primeiro Login',
        help_text='True se o usuário ainda não alterou a senha inicial'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Criação'
    )
    
    last_access = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Último Acesso'
    )
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.company})"
    
    def update_last_access(self):
        """Atualiza o último acesso do usuário"""
        self.last_access = timezone.now()
        self.save(update_fields=['last_access'])
    
    @property
    def is_admin(self):
        """Verifica se o usuário é administrador"""
        return self.user_type == 'admin'
    
    @property
    def is_client(self):
        """Verifica se o usuário é cliente"""
        return self.user_type == 'client'


class ClientProfile(models.Model):
    """
    Perfil estendido para clientes
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='client_profile',
        verbose_name='Usuário'
    )
    
    contact_person = models.CharField(
        max_length=100,
        verbose_name='Pessoa de Contato'
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name='Observações'
    )
    
    registration_completed = models.BooleanField(
        default=False,
        verbose_name='Cadastro Completo'
    )
    
    class Meta:
        verbose_name = 'Perfil do Cliente'
        verbose_name_plural = 'Perfis dos Clientes'
    
    def __str__(self):
        return f"Perfil: {self.user.get_full_name() or self.user.username}"