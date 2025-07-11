# GSLEARNING - core/media_views.py
# Views protegidas para servir arquivos de mídia com controle de acesso

import os
import mimetypes
from django.http import HttpResponse, Http404, HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt

# Imports dos models necessários
from training.models import TrainingModule
from certificates.models import Certificate
from equipment.models import ClientEquipment


@login_required
@never_cache
def serve_training_video(request, path):
    print(f"🔒 PROTEÇÃO ATIVA: Tentativa de acesso a {path} por {request.user}")
    """
    Serve vídeos de treinamento apenas para usuários autenticados
    que têm acesso ao equipamento correspondente
    """
    # Construir caminho completo do arquivo
    file_path = os.path.join(settings.MEDIA_ROOT, 'training', 'videos', path)
    
    # Verificar se arquivo existe
    if not os.path.exists(file_path):
        raise Http404("Vídeo não encontrado")
    
    # Encontrar o módulo de treinamento correspondente
    try:
        # Extrair nome do arquivo sem extensão para busca
        filename = os.path.basename(path)
        module = TrainingModule.objects.get(
            video_file__icontains=filename,
            is_active=True
        )
    except TrainingModule.DoesNotExist:
        raise Http404("Módulo de treinamento não encontrado")
    
    # Verificar se o usuário tem acesso ao equipamento
    user = request.user
    
    # Admin sempre tem acesso
    if user.is_admin:
        return _serve_file(file_path, filename)
    
    # Cliente deve ter o equipamento associado
    if user.user_type == 'client':
        has_access = ClientEquipment.objects.filter(
            client=user,
            equipment=module.equipment,
            is_active=True
        ).exists()
        
        if has_access:
            return _serve_file(file_path, filename)
        else:
            return HttpResponseForbidden("Você não tem acesso a este conteúdo")
    
    # Qualquer outro caso: acesso negado
    return HttpResponseForbidden("Acesso não autorizado")


@login_required
@never_cache
def serve_certificate_pdf(request, path):
    """
    Serve certificados PDF apenas para o cliente proprietário
    """
    # Construir caminho completo do arquivo
    file_path = os.path.join(settings.MEDIA_ROOT, 'certificates', 'pdfs', path)
    
    # Verificar se arquivo existe
    if not os.path.exists(file_path):
        raise Http404("Certificado não encontrado")
    
    # Encontrar o certificado correspondente
    try:
        # Extrair código do certificado do nome do arquivo
        filename = os.path.basename(path)
        # Assumindo formato: certificado_{equipment}_{client}_{code}.pdf
        certificate = Certificate.objects.get(
            pdf_file__icontains=filename,
            is_valid=True
        )
    except Certificate.DoesNotExist:
        raise Http404("Certificado não encontrado no sistema")
    
    # Verificar permissões
    user = request.user
    
    # Admin sempre tem acesso
    if user.is_admin:
        return _serve_file(file_path, filename, content_type='application/pdf')
    
    # Cliente só pode acessar seus próprios certificados
    if user.user_type == 'client' and certificate.client == user:
        # Incrementar contador de downloads
        certificate.increment_download()
        return _serve_file(file_path, filename, content_type='application/pdf')
    
    # Acesso negado
    return HttpResponseForbidden("Você não tem acesso a este certificado")


@login_required
@never_cache
def serve_equipment_image(request, path):
    """
    Serve imagens de equipamentos (menos crítico, mas por consistência)
    """
    # Construir caminho completo do arquivo
    file_path = os.path.join(settings.MEDIA_ROOT, 'equipment', 'images', path)
    
    # Verificar se arquivo existe
    if not os.path.exists(file_path):
        raise Http404("Imagem não encontrada")
    
    filename = os.path.basename(path)
    
    # Imagens de equipamentos são menos sensíveis
    # Qualquer usuário logado pode ver
    return _serve_file(file_path, filename)


def _serve_file(file_path, filename, content_type=None):
    """
    Função auxiliar para servir arquivos de forma segura
    """
    try:
        # Detectar tipo de conteúdo se não especificado
        if content_type is None:
            content_type, _ = mimetypes.guess_type(file_path)
            if content_type is None:
                content_type = 'application/octet-stream'
        
        # Abrir e ler arquivo
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type=content_type)
            
            # Headers de segurança
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            response['X-Content-Type-Options'] = 'nosniff'
            response['Cache-Control'] = 'private, no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
            return response
            
    except IOError:
        raise Http404("Erro ao acessar arquivo")


# Função adicional para servir arquivos de template de certificado (apenas admin)
@login_required
@never_cache
def serve_certificate_template(request, path):
    """
    Serve templates de certificados apenas para admins
    """
    # Verificar se é admin
    if not request.user.is_admin:
        return HttpResponseForbidden("Apenas administradores podem acessar templates")
    
    # Construir caminho completo do arquivo
    file_path = os.path.join(settings.MEDIA_ROOT, 'certificates', 'templates', path)
    
    # Verificar se arquivo existe
    if not os.path.exists(file_path):
        raise Http404("Template não encontrado")
    
    filename = os.path.basename(path)
    return _serve_file(file_path, filename)