"""
Views para o sistema de certificados - VERSÃO FUNCIONAL
Implementação da área do cliente para ver e baixar certificados
"""

# GSLEARNING - certificates/views.py

from django.shortcuts import render, get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import ListView, DetailView, TemplateView
from django.http import HttpResponse, Http404
from django.contrib import messages

from .models import Certificate, CertificateTemplate


class AdminRequiredMixin(UserPassesTestMixin):
    """Mixin para verificar se o usuário é admin"""
    
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_admin


# ===== VIEWS DO CLIENTE =====

class CertificateListView(LoginRequiredMixin, ListView):
    """Lista de certificados do cliente logado"""
    model = Certificate
    template_name = 'certificates/client_list.html'
    context_object_name = 'certificates'
    
    def get_queryset(self):
        """Filtrar apenas certificados do cliente logado"""
        return Certificate.objects.filter(
            client=self.request.user,
            is_valid=True
        ).select_related('equipment', 'equipment__category').order_by('-issued_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        
        # Estatísticas para o cliente
        context['total_certificates'] = context['certificates'].count()
        
        # Equipamentos com certificados
        context['certificated_equipments'] = [cert.equipment for cert in context['certificates']]
        
        return context


class CertificateDownloadView(LoginRequiredMixin, DetailView):
    """Download do certificado em PDF"""
    model = Certificate
    slug_field = 'certificate_code'
    slug_url_kwarg = 'certificate_code'
    
    def get_queryset(self):
        """Apenas certificados do cliente logado"""
        return Certificate.objects.filter(
            client=self.request.user,
            is_valid=True
        )
    
    def get(self, request, *args, **kwargs):
        """Retornar o arquivo PDF para download"""
        certificate = self.get_object()
        
        if not certificate.pdf_file:
            messages.error(request, 'Arquivo do certificado não encontrado.')
            return Http404('Arquivo não encontrado')
        
        # Incrementar contador de downloads
        certificate.increment_download()
        
        # Preparar resposta com arquivo PDF
        response = HttpResponse(
            certificate.pdf_file.read(),
            content_type='application/pdf'
        )
        
        # Nome do arquivo para download
        filename = f"certificado_{certificate.equipment.name}_{certificate.client.username}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response


# ===== VIEWS PÚBLICAS =====

class CertificateVerifyView(TemplateView):
    """Verificação pública de certificado"""
    template_name = 'certificates/verify.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        verification_hash = kwargs.get('verification_hash')
        
        try:
            certificate = Certificate.objects.get(
                verification_hash=verification_hash,
                is_valid=True
            )
            context['certificate'] = certificate
            context['valid'] = True
        except Certificate.DoesNotExist:
            context['valid'] = False
            context['error'] = 'Certificado não encontrado ou inválido.'
        
        return context


# ===== VIEWS ADMINISTRATIVAS =====

class AdminCertificateListView(LoginRequiredMixin, AdminRequiredMixin, ListView):
    """Lista todos os certificados para admin"""
    model = Certificate
    template_name = 'admin/certificates/list.html'
    context_object_name = 'certificates'
    paginate_by = 20
    
    def get_queryset(self):
        return Certificate.objects.select_related(
            'client', 'equipment', 'equipment__category'
        ).order_by('-issued_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Estatísticas administrativas
        context['total_certificates'] = Certificate.objects.count()
        context['valid_certificates'] = Certificate.objects.filter(is_valid=True).count()
        context['total_downloads'] = sum(
            cert.download_count for cert in Certificate.objects.all()
        )
        
        return context


class TemplateListView(LoginRequiredMixin, AdminRequiredMixin, ListView):
    """Lista de templates de certificados"""
    model = CertificateTemplate
    template_name = 'admin/certificates/template_list.html'
    context_object_name = 'templates'


class TemplateCreateView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    """Criação de template de certificado"""
    template_name = 'admin/certificates/template_create.html'