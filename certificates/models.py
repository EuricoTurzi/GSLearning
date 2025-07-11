"""
Models para o sistema de certificados
"""

# GSLEARNING - certificates/models.py

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from equipment.models import Equipment

User = get_user_model()


class Certificate(models.Model):
    """
    Certificados gerados automaticamente após conclusão do treinamento
    """
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='certificates',
        limit_choices_to={'user_type': 'client'},
        verbose_name='Cliente'
    )
    
    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='certificates',
        verbose_name='Equipamento'
    )
    
    certificate_code = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        verbose_name='Código do Certificado'
    )
    
    verification_hash = models.CharField(
        max_length=64,
        unique=True,
        verbose_name='Hash de Verificação'
    )
    
    pdf_file = models.FileField(
        upload_to='certificates/pdfs/',
        verbose_name='Arquivo PDF'
    )
    
    issued_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Emissão'
    )
    
    is_valid = models.BooleanField(
        default=True,
        verbose_name='Válido'
    )
    
    download_count = models.IntegerField(
        default=0,
        verbose_name='Downloads'
    )
    
    class Meta:
        verbose_name = 'Certificado'
        verbose_name_plural = 'Certificados'
        ordering = ['-issued_at']
        unique_together = ['client', 'equipment']
    
    def __str__(self):
        return f"Certificado: {self.client.get_full_name()} - {self.equipment.name}"
    
    def increment_download(self):
        """Incrementa o contador de downloads"""
        self.download_count += 1
        self.save(update_fields=['download_count'])
    
    @property
    def verification_url(self):
        """Retorna a URL de verificação do certificado"""
        from django.urls import reverse
        return reverse('certificates:verify', args=[self.verification_hash])


class CertificateTemplate(models.Model):
    """
    Templates para geração de certificados
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nome do Template'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Descrição'
    )
    
    template_file = models.FileField(
        upload_to='certificates/templates/',
        help_text='Arquivo HTML do template',
        verbose_name='Arquivo do Template'
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
        verbose_name = 'Template de Certificado'
        verbose_name_plural = 'Templates de Certificados'
        ordering = ['name']
    
    def __str__(self):
        return self.name