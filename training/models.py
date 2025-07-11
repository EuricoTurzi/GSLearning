"""
Models para o sistema de treinamento
"""

# GSLEARNING - training/models.py

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from equipment.models import Equipment

User = get_user_model()


class TrainingModule(models.Model):
    """
    Módulos de treinamento (vídeos) organizados por equipamento
    """
    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='training_modules',
        verbose_name='Equipamento'
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name='Título do Módulo'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Descrição'
    )
    
    video_file = models.FileField(
        upload_to='training/videos/',
        verbose_name='Arquivo de Vídeo'
    )
    
    duration_seconds = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Duração em Segundos'
    )
    
    order = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='Ordem do Módulo'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Ativo'
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
        verbose_name = 'Módulo de Treinamento'
        verbose_name_plural = 'Módulos de Treinamento'
        ordering = ['equipment', 'order']
        unique_together = ['equipment', 'order']
    
    def __str__(self):
        return f"{self.equipment.name} - Módulo {self.order}: {self.title}"
    
    @property
    def duration_formatted(self):
        """Retorna a duração formatada em mm:ss"""
        minutes = self.duration_seconds // 60
        seconds = self.duration_seconds % 60
        return f"{minutes:02d}:{seconds:02d}"


class TrainingProgress(models.Model):
    """
    Progresso do cliente em cada módulo de treinamento
    """
    STATUS_CHOICES = [
        ('not_started', 'Não Iniciado'),
        ('in_progress', 'Em Progresso'),
        ('completed', 'Concluído'),
    ]
    
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='training_progress',
        limit_choices_to={'user_type': 'client'},
        verbose_name='Cliente'
    )
    
    module = models.ForeignKey(
        TrainingModule,
        on_delete=models.CASCADE,
        related_name='progress_records',
        verbose_name='Módulo'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='not_started',
        verbose_name='Status'
    )
    
    watch_time_seconds = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Tempo Assistido (segundos)'
    )
    
    completion_percentage = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        verbose_name='Percentual de Conclusão'
    )
    
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Iniciado em'
    )
    
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Concluído em'
    )
    
    last_position_seconds = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Última Posição (segundos)'
    )
    
    attempts = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Tentativas'
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
        verbose_name = 'Progresso do Treinamento'
        verbose_name_plural = 'Progressos dos Treinamentos'
        unique_together = ['client', 'module']
    
    def __str__(self):
        return f"{self.client.get_full_name()} - {self.module.title} ({self.status})"
    
    def start_module(self):
        """Inicia o módulo de treinamento"""
        if self.status == 'not_started':
            self.status = 'in_progress'
            self.started_at = timezone.now()
            self.attempts += 1
            self.save()
    
    def update_progress(self, current_time_seconds):
        """Atualiza o progresso baseado no tempo atual do vídeo"""
        self.last_position_seconds = current_time_seconds
        self.watch_time_seconds = max(self.watch_time_seconds, current_time_seconds)
        
        # Calcula percentual de conclusão
        if self.module.duration_seconds > 0:
            self.completion_percentage = (self.watch_time_seconds / self.module.duration_seconds) * 100
            
            # Marca como concluído se assistiu pelo menos 95%
            if self.completion_percentage >= 95 and self.status != 'completed':
                self.status = 'completed'
                self.completed_at = timezone.now()
                self.completion_percentage = 100.0
        
        self.save()
    
    @property
    def is_completed(self):
        """Verifica se o módulo foi concluído"""
        return self.status == 'completed'


class EquipmentTrainingProgress(models.Model):
    """
    Progresso geral do cliente em um equipamento específico
    """
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='equipment_progress',
        limit_choices_to={'user_type': 'client'},
        verbose_name='Cliente'
    )
    
    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='client_progress',
        verbose_name='Equipamento'
    )
    
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Iniciado em'
    )
    
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Concluído em'
    )
    
    total_watch_time_seconds = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Tempo Total Assistido (segundos)'
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
        verbose_name = 'Progresso do Equipamento'
        verbose_name_plural = 'Progressos dos Equipamentos'
        unique_together = ['client', 'equipment']
    
    def __str__(self):
        return f"{self.client.get_full_name()} - {self.equipment.name}"
    
    @property
    def completion_percentage(self):
        """Calcula o percentual de conclusão do equipamento"""
        total_modules = self.equipment.training_modules.filter(is_active=True).count()
        if total_modules == 0:
            return 0
        
        completed_modules = TrainingProgress.objects.filter(
            client=self.client,
            module__equipment=self.equipment,
            status='completed'
        ).count()
        
        return (completed_modules / total_modules) * 100
    
    @property
    def is_completed(self):
        """Verifica se todo o treinamento do equipamento foi concluído"""
        return self.completion_percentage >= 100
    
    def update_progress(self):
        """Atualiza o progresso geral do equipamento"""
        # Calcula tempo total assistido
        total_time = TrainingProgress.objects.filter(
            client=self.client,
            module__equipment=self.equipment
        ).aggregate(
            total=models.Sum('watch_time_seconds')
        )['total'] or 0
        
        self.total_watch_time_seconds = total_time
        
        # Verifica se foi concluído
        if self.is_completed and not self.completed_at:
            self.completed_at = timezone.now()
        
        self.save()