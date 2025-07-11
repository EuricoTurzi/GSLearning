"""
Gerador de certificados usando ReportLab
VERSÃO 2 - VISUAL PREMIUM (dourado + fundo escuro + cursiva)
"""

# GSLEARNING - certificates/utils.py

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import Color, black, white
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfgen import canvas

import hashlib
import uuid
from datetime import datetime
from django.core.files.base import ContentFile
from io import BytesIO

from .models import Certificate


def generate_premium_certificate(client, equipment):
    """
    Função premium para gerar certificado com visual dourado + fundo escuro
    
    Args:
        client: Instância do modelo User (cliente)
        equipment: Instância do modelo Equipment
    
    Returns:
        Certificate: Instância do certificado criado
    """
    completion_date = datetime.now()
    
    # Gerar código único e hash
    certificate_code = uuid.uuid4()
    verification_hash = hashlib.sha256(
        f"{client.id}_{equipment.id}_{completion_date.isoformat()}".encode()
    ).hexdigest()
    
    # Criar buffer para o PDF
    buffer = BytesIO()
    
    # Configurar documento
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # CORES PREMIUM
    dourado = Color(0.85, 0.65, 0.13)  # Dourado elegante
    dourado_claro = Color(0.95, 0.85, 0.4)  # Dourado claro
    branco = Color(1, 1, 1)  # Branco puro
    cinza_claro = Color(0.9, 0.9, 0.9)  # Cinza claro
    
    # ESTILOS PREMIUM
    styles = getSampleStyleSheet()
    
    # Título principal - Dourado + Cursivo
    title_style = ParagraphStyle(
        'PremiumTitle',
        parent=styles['Title'],
        fontSize=32,
        textColor=dourado,
        alignment=TA_CENTER,
        spaceAfter=30,
        fontName='Times-BoldItalic',  # Cursiva elegante
    )
    
    # Subtítulo - Dourado claro
    subtitle_style = ParagraphStyle(
        'PremiumSubtitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=dourado_claro,
        alignment=TA_CENTER,
        spaceAfter=20,
        fontName='Times-Italic',  # Cursiva
    )
    
    # Nome do cliente - Dourado + Grande + Cursiva
    name_style = ParagraphStyle(
        'ClientNamePremium',
        parent=styles['Normal'],
        fontSize=28,
        textColor=dourado,
        alignment=TA_CENTER,
        spaceAfter=25,
        fontName='Times-BoldItalic',  # Cursiva bold
    )
    
    # Texto corpo - Branco elegante
    body_style = ParagraphStyle(
        'PremiumBody',
        parent=styles['Normal'],
        fontSize=14,
        textColor=branco,
        alignment=TA_CENTER,
        spaceAfter=15,
        fontName='Times-Italic',  # Cursiva
    )
    
    # Data e código - Cinza claro
    info_style = ParagraphStyle(
        'PremiumInfo',
        parent=styles['Normal'],
        fontSize=12,
        textColor=cinza_claro,
        alignment=TA_CENTER,
        spaceAfter=10,
        fontName='Times-Roman',
    )
    
    # Criar conteúdo do certificado
    story = []
    
    # Espaçamento inicial
    story.append(Spacer(1, 1.5*cm))
    
    # Título principal
    story.append(Paragraph("CERTIFICADO DE CONCLUSÃO", title_style))
    
    # Subtítulo elegante
    story.append(Paragraph("~ Treinamento em Equipamentos Técnicos ~", subtitle_style))
    story.append(Spacer(1, 0.8*cm))
    
    # Texto introdutório
    story.append(Paragraph("Certificamos que", body_style))
    story.append(Spacer(1, 0.3*cm))
    
    # Nome do cliente em destaque
    client_name = client.get_full_name() or client.username
    story.append(Paragraph(f"<i>{client_name.upper()}</i>", name_style))
    story.append(Spacer(1, 0.5*cm))
    
    # Texto principal elegante
    company_text = f"da empresa <b>{client.company}</b><br/>" if client.company else ""
    cert_text = f"""
    {company_text}
    <i>concluiu com êxito o treinamento para o equipamento</i><br/><br/>
    <b>{equipment.category.name} - {equipment.name}</b><br/>
    <i>Modelo: {equipment.model}</i>
    """
    story.append(Paragraph(cert_text, body_style))
    story.append(Spacer(1, 1*cm))
    
    # Data de conclusão
    date_text = f"<i>Concluído em {completion_date.strftime('%d de %B de %Y')}</i>"
    story.append(Paragraph(date_text, info_style))
    story.append(Spacer(1, 0.8*cm))
    
    # Código de verificação
    code_text = f"Código de Verificação: {str(certificate_code)[:8]}...{str(certificate_code)[-8:]}"
    story.append(Paragraph(code_text, info_style))
    story.append(Spacer(1, 0.5*cm))
    
    # Assinatura digital
    signature_text = "<i>~ GSLearning - Certificação Profissional ~</i>"
    story.append(Paragraph(signature_text, subtitle_style))
    
    # Gerar PDF com fundo personalizado
    doc.build(story, onFirstPage=add_premium_background, onLaterPages=add_premium_background)
    
    # Criar registro no banco
    certificate = Certificate.objects.create(
        client=client,
        equipment=equipment,
        certificate_code=certificate_code,
        verification_hash=verification_hash,
    )
    
    # Salvar arquivo
    pdf_content = buffer.getvalue()
    filename = f"certificado_premium_{client.username}_{equipment.model}.pdf"
    certificate.pdf_file.save(filename, ContentFile(pdf_content))
    
    buffer.close()
    
    return certificate


def add_premium_background(canvas, doc):
    """Adicionar fundo escuro elegante e bordas douradas"""
    canvas.saveState()
    
    # Obter dimensões da página
    width, height = landscape(A4)
    
    # FUNDO ESCURO ELEGANTE
    canvas.setFillColor(Color(0.08, 0.08, 0.12))  # Azul escuro elegante
    canvas.rect(0, 0, width, height, fill=1)
    
    # BORDA EXTERNA DOURADA
    canvas.setStrokeColor(Color(0.85, 0.65, 0.13))  # Dourado
    canvas.setLineWidth(4)
    canvas.rect(1*cm, 1*cm, width-2*cm, height-2*cm)
    
    # BORDA INTERNA DOURADA CLARO
    canvas.setStrokeColor(Color(0.95, 0.85, 0.4))  # Dourado claro
    canvas.setLineWidth(2)
    canvas.rect(1.5*cm, 1.5*cm, width-3*cm, height-3*cm)
    
    # ORNAMENTOS DOURADOS NOS CANTOS
    dourado = Color(0.85, 0.65, 0.13)
    canvas.setFillColor(dourado)
    
    # Ornamento superior esquerdo
    canvas.circle(2*cm, height-2*cm, 0.3*cm, fill=1)
    
    # Ornamento superior direito  
    canvas.circle(width-2*cm, height-2*cm, 0.3*cm, fill=1)
    
    # Ornamento inferior esquerdo
    canvas.circle(2*cm, 2*cm, 0.3*cm, fill=1)
    
    # Ornamento inferior direito
    canvas.circle(width-2*cm, 2*cm, 0.3*cm, fill=1)
    
    # LINHA DECORATIVA CENTRAL
    canvas.setStrokeColor(Color(0.95, 0.85, 0.4))
    canvas.setLineWidth(1)
    canvas.line(width/4, height/2, 3*width/4, height/2)
    
    canvas.restoreState()


# Manter função antiga para compatibilidade
def generate_simple_certificate(client, equipment):
    """Função de compatibilidade - usa a versão premium"""
    return generate_premium_certificate(client, equipment)