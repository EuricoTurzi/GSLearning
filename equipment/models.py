"""
Models para equipamentos e categorias
"""

# GSLEARNING - equipment/models.py

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()


class EquipmentCategory(models.Model):
    """
    Categorias de equipamentos (Isca, Cadeado, Rastreador)
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nome da Categoria'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Descrição'
    )
    
    icon = models.CharField(
        max_length=50,
        default='cube',
        help_text='Nome do ícone Heroicons',
        verbose_name='Ícone'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Ativo'
    )
    
    order = models.IntegerField(
        default=0,
        verbose_name='Ordem de Exibição'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Criação'
    )
    
    class Meta:
        verbose_name = 'Categoria de Equipamento'
        verbose_name_plural = 'Categorias de Equipamentos'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Equipment(models.Model):
    """
    Modelos específicos de equipamentos
    """
    category = models.ForeignKey(
        EquipmentCategory,
        on_delete=models.CASCADE,
        related_name='equipments',
        verbose_name='Categoria'
    )
    
    name = models.CharField(
        max_length=200,
        verbose_name='Nome do Equipamento'
    )
    
    model = models.CharField(
        max_length=100,
        verbose_name='Modelo'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Descrição Técnica'
    )
    
    image = models.ImageField(
        upload_to='equipment/images/',
        blank=True,
        null=True,
        verbose_name='Imagem Ilustrativa'
    )
    
    estimated_duration = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text='Duração estimada em minutos',
        verbose_name='Duração Estimada (min)'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Ativo'
    )
    
    order = models.IntegerField(
        default=0,
        verbose_name='Ordem de Exibição'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Criação'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última Atualização'
    )
    
    class Meta:
        verbose_name = 'Equipamento'
        verbose_name_plural = 'Equipamentos'
        ordering = ['category__order', 'order', 'name']
        unique_together = ['category', 'model']
    
    def __str__(self):
        return f"{self.category.name} - {self.name} ({self.model})"
    
    @property
    def total_modules(self):
        """Retorna o número total de módulos do equipamento"""
        return self.training_modules.filter(is_active=True).count()


class ClientEquipment(models.Model):
    """
    Relacionamento entre clientes e equipamentos que possuem
    """
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='client_equipments',
        limit_choices_to={'user_type': 'client'},
        verbose_name='Cliente'
    )
    
    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='equipment_clients',
        verbose_name='Equipamento'
    )
    
    assigned_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Atribuição'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Ativo'
    )
    
    class Meta:
        verbose_name = 'Equipamento do Cliente'
        verbose_name_plural = 'Equipamentos dos Clientes'
        unique_together = ['client', 'equipment']
    
    def __str__(self):
        return f"{self.client.get_full_name()} - {self.equipment.name}"