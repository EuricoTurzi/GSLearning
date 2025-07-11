"""
Utilitários para auto-geração de certificados
PASSO 3 - Automação na conclusão do treinamento
"""

# GSLEARNING - training/utils.py

from django.db.models import Count
from certificates.utils import generate_simple_certificate
from certificates.models import Certificate
from .models import TrainingModule, TrainingProgress, EquipmentTrainingProgress
from accounts.utils import send_certificate_notification


def check_and_generate_certificate(client, equipment):
    """
    Verificar se cliente completou treinamento e gerar certificado automaticamente
    
    Args:
        client: Instância do modelo User (cliente)
        equipment: Instância do modelo Equipment
    
    Returns:
        tuple: (certificate_generated: bool, certificate: Certificate or None)
    """
    
    # 1. VERIFICAR SE JÁ EXISTE CERTIFICADO
    existing_certificate = Certificate.objects.filter(
        client=client,
        equipment=equipment
    ).first()
    
    if existing_certificate:
        print(f"✅ Certificado já existe para {client.username} - {equipment.name}")
        return False, existing_certificate
    
    # 2. VERIFICAR SE COMPLETOU TODOS OS MÓDULOS
    total_modules = TrainingModule.objects.filter(
        equipment=equipment,
        is_active=True
    ).count()
    
    if total_modules == 0:
        print(f"⚠️ Nenhum módulo ativo encontrado para {equipment.name}")
        return False, None
    
    completed_modules = TrainingProgress.objects.filter(
        client=client,
        module__equipment=equipment,
        status='completed'
    ).count()
    
    print(f"📊 Progresso: {completed_modules}/{total_modules} módulos concluídos")
    
    # 3. VERIFICAR SE ATINGIU 100%
    if completed_modules >= total_modules:
        try:
            # GERAR CERTIFICADO AUTOMATICAMENTE
            certificate = generate_simple_certificate(client, equipment)
            
            # ATUALIZAR PROGRESSO DO EQUIPAMENTO
            equipment_progress, created = EquipmentTrainingProgress.objects.get_or_create(
                client=client,
                equipment=equipment
            )
            equipment_progress.update_progress()
            
            print(f"🎉 Certificado gerado automaticamente: {certificate.certificate_code}")
            
            # ENVIAR EMAIL DE NOTIFICAÇÃO
            send_certificate_notification(certificate)
            
            return True, certificate
            
        except Exception as e:
            print(f"❌ Erro ao gerar certificado: {str(e)}")
            return False, None
    else:
        print(f"⏳ Treinamento incompleto: {completed_modules}/{total_modules}")
        return False, None


def update_progress_and_check_completion(client, module):
    """
    Atualizar progresso e verificar se deve gerar certificado
    Esta função será chamada quando um módulo for concluído
    
    Args:
        client: Instância do modelo User
        module: Instância do modelo TrainingModule
    
    Returns:
        tuple: (certificate_generated: bool, certificate: Certificate or None)
    """
    
    equipment = module.equipment
    
    print(f"🔄 Verificando conclusão para {client.username} - {equipment.name}")
    
    # Chamar função principal de verificação
    return check_and_generate_certificate(client, equipment)