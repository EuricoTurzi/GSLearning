"""
URLs para o sistema de certificados - VERSÃO ATUALIZADA
Adicionando área do cliente para visualizar e baixar certificados
"""

# GSLEARNING - certificates/urls.py

from django.urls import path
from . import views

app_name = 'certificates'

urlpatterns = [
    # URLs do cliente - NOVAS!
    path('', views.CertificateListView.as_view(), name='list'),
    path('<uuid:certificate_code>/download/', views.CertificateDownloadView.as_view(), name='download'),
    
    # URLs públicas
    path('verify/<str:verification_hash>/', views.CertificateVerifyView.as_view(), name='verify'),
    
    # URLs administrativas
    path('admin/', views.AdminCertificateListView.as_view(), name='admin_list'),
    path('admin/templates/', views.TemplateListView.as_view(), name='template_list'),
    path('admin/templates/create/', views.TemplateCreateView.as_view(), name='template_create'),
]