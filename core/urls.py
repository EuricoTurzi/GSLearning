"""
URL Configuration para Plataforma de Treinamento
"""

# GSLEARNING - core/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

from . import media_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='/login/', permanent=False)),
    path('', include('accounts.urls')),
    path('equipment/', include('equipment.urls')),
    path('training/', include('training.urls')),
    path('certificates/', include('certificates.urls')),
]

# Intercepta o acesso direto aos arquivos e aplica controle de acesso
media_protected_urlpatterns = [
    # Vídeos de treinamento (CRÍTICO)
    path('media/training/videos/<path:path>', 
         media_views.serve_training_video, 
         name='serve_training_video'),
    
    # Certificados PDF (CRÍTICO)  
    path('media/certificates/pdfs/<path:path>', 
         media_views.serve_certificate_pdf, 
         name='serve_certificate_pdf'),
    
    # Templates de certificado (ADMIN APENAS)
    path('media/certificates/templates/<path:path>', 
         media_views.serve_certificate_template, 
         name='serve_certificate_template'),
    
    # Imagens de equipamentos (MENOS CRÍTICO)
    path('media/equipment/images/<path:path>', 
         media_views.serve_equipment_image, 
         name='serve_equipment_image'),
]

urlpatterns = media_protected_urlpatterns + urlpatterns

# Servir arquivos de mídia durante o desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customização do Admin
admin.site.site_header = "Plataforma de Treinamento - Administração"
admin.site.site_title = "Admin Plataforma"
admin.site.index_title = "Painel Administrativo"