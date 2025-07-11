"""
Utilitários para envio de emails e geração de senhas
PASSO 1 - Adicionando APENAS a geração de senhas seguras
"""

# GSLEARNING - accounts/utils.py

import string
import secrets
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags


def generate_secure_password(length=8):
    """
    Gera uma senha temporária simples para primeiro acesso
    Apenas letras maiúsculas e minúsculas (fácil de digitar)
    
    Args:
        length (int): Tamanho da senha (padrão: 8 caracteres)
    
    Returns:
        str: Senha temporária simples
    """
    
    # Apenas letras - sem confusão entre l/I, O/0, etc.
    lowercase = 'abcdefghijkmnopqrstuvwxyz'
    uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    
    # Garantir pelo menos 2 maiúsculas e 2 minúsculas
    password = [
        secrets.choice(uppercase),
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(lowercase)
    ]
    
    # Preencher o resto alternando aleatoriamente
    all_chars = lowercase + uppercase
    for _ in range(length - 4):
        password.append(secrets.choice(all_chars))
    
    # Embaralhar a ordem
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)


# ===== FUNÇÕES EXISTENTES (não modificadas) =====

def send_welcome_email(client, password):
    """
    Envia email de boas-vindas com credenciais para novo cliente
    
    Args:
        client: Instância do modelo User (cliente)
        password: Senha temporária gerada
    
    Returns:
        bool: True se enviado com sucesso, False caso contrário
    """
    
    try:
        # Renderizar template HTML
        html_message = render_to_string('emails/welcome_email.html', {
            'client': client,
            'password': password,
            'login_url': 'http://localhost:8000/login/',  # TODO: usar domain real
        })
        
        # Versão texto (sem HTML)
        plain_message = strip_tags(html_message)
        
        # Enviar email
        send_mail(
            subject=f'Bem-vindo ao GSLearning - {client.get_full_name() or client.username}',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[client.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        print(f"📧 Email de boas-vindas enviado para: {client.email}")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao enviar email de boas-vindas: {str(e)}")
        return False


def send_certificate_notification(certificate):
    """
    Envia email notificando sobre certificado gerado
    
    Args:
        certificate: Instância do modelo Certificate
    
    Returns:
        bool: True se enviado com sucesso, False caso contrário
    """
    
    try:
        client = certificate.client
        
        # Renderizar template HTML
        html_message = render_to_string('emails/certificate_email.html', {
            'client': client,
            'certificate': certificate,
            'equipment': certificate.equipment,
            'download_url': f'http://localhost:8000/certificates/{certificate.certificate_code}/download/',  # TODO: usar domain real
        })
        
        # Versão texto
        plain_message = strip_tags(html_message)
        
        # Enviar email
        send_mail(
            subject=f'🎓 Certificado Disponível - {certificate.equipment.name}',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[client.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        print(f"📧 Email de certificado enviado para: {client.email}")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao enviar email de certificado: {str(e)}")
        return False