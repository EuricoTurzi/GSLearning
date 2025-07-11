# 🎓 GSLearning - Plataforma de Treinamento

**Automatização de Treinamentos em Equipamentos Técnicos Corporativos**

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.2%2B-green.svg)](https://djangoproject.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue.svg)](https://postgresql.org)
[![Status](https://img.shields.io/badge/Status-99%25%20Funcional-brightgreen.svg)](https://github.com)

## 📋 Visão Geral

O **GSLearning** é uma plataforma web desenvolvida para automatizar o processo de treinamento de clientes em equipamentos técnicos (Iscas, Cadeados e Rastreadores de Container), substituindo sessões ao vivo de 1 hora por treinamentos modulares em vídeo com certificação digital automática.

### 🎯 Benefícios

- ✅ **Redução de tempo** da equipe técnica
- ✅ **Padronização** do conteúdo de treinamento  
- ✅ **Flexibilidade** para o cliente assistir no próprio ritmo
- ✅ **Rastreabilidade completa** do progresso
- ✅ **Certificação automática** com validade legal

## 🚀 Funcionalidades

### 👨‍💼 Área Administrativa
- **Dashboard Administrativo** com visão geral de clientes e estatísticas
- **Gestão de Clientes** com cadastro e controle de equipamentos
- **Gestão de Conteúdo** com upload e organização de vídeos por categoria
- **Relatórios Completos** de progresso e uso da plataforma

### 👤 Área do Cliente  
- **Player Anti-Burla** com controle rigoroso de tempo assistido
- **Navegação Sequencial** entre módulos (liberação progressiva)
- **Certificação Automática** em PDF com código de verificação
- **Email Automático** de boas-vindas e notificações

### 🔒 Segurança
- **Proteção de Conteúdo** contra download direto
- **Controle de Acesso** segregado por cliente
- **Headers de Proteção** XSS, Clickjacking, CSRF
- **Logs de Auditoria** para rastreabilidade completa

## 🛠️ Stack Tecnológico

### Backend
- **Framework:** Django 4.2+
- **Banco de Dados:** PostgreSQL 14+
- **ORM:** Django ORM nativo
- **Autenticação:** Django Auth System
- **Task Queue:** Celery + Redis

### Frontend
- **CSS Framework:** Tailwind CSS
- **JavaScript:** Vanilla JS + Alpine.js
- **Template Engine:** Django Templates
- **Design:** Mobile-first, Responsivo
- **Ícones:** Heroicons

### Infraestrutura
- **Servidor:** DigitalOcean Droplet / AWS EC2
- **Proxy:** Nginx para arquivos estáticos
- **SSL:** Let's Encrypt
- **Monitoramento:** Sentry para logs de erro
- **Deploy:** Docker + Docker Compose

## 📁 Estrutura do Projeto

```
GSLearning/
├── 🐍 manage.py                 # Ponto de entrada Django
├── 📁 core/                     # Configurações principais
├── 📁 accounts/                 # Sistema de usuários
├── 📁 equipment/                # Gestão de equipamentos  
├── 📁 training/                 # Sistema de treinamento
├── 📁 certificates/             # Certificação
├── 📁 templates/                # Templates HTML
├── 📁 media/                    # Uploads (vídeos, imagens, PDFs)
├── 📁 static/                   # Arquivos estáticos
├── 📁 logs/                     # Logs do sistema
└── 📁 venv/                     # Ambiente virtual Python
```

## ⚙️ Instalação e Configuração

### 📋 Pré-requisitos

- Python 3.9+
- PostgreSQL 14+
- Redis (para tarefas assíncronas)
- Git

### 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/GSLearning.git
cd GSLearning
```

2. **Crie o ambiente virtual**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

3. **Instale as dependências**
```bash
pip install -r requirements.txt
```

4. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

5. **Configure o banco de dados**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Crie um superusuário**
```bash
python manage.py createsuperuser
```

7. **Inicie o servidor**
```bash
python manage.py runserver
```

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Django
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Banco de Dados
DB_NAME=plataforma_treinamento
DB_USER=postgres
DB_PASSWORD=sua-senha-postgres
DB_HOST=localhost
DB_PORT=5432

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-app
DEFAULT_FROM_EMAIL=GSLearning <noreply@gslearning.com>

# Redis (para Celery)
REDIS_URL=redis://localhost:6379/0
```

## 📊 Uso da Plataforma

### 🔐 Acesso Administrativo
1. Acesse `/admin/` com suas credenciais de superusuário
2. Cadastre categorias de equipamentos
3. Adicione equipamentos e módulos de treinamento
4. Faça upload dos vídeos

### 👥 Gestão de Clientes
1. Acesse `/dashboard/` após login
2. Cadastre novos clientes na seção "Clientes"
3. Selecione os equipamentos que o cliente possui
4. O sistema enviará email automático com credenciais

### 🎬 Player de Vídeo
- **Controle Anti-Burla:** Detecta aba inativa e tentativas de manipulação
- **Tempo Mínimo:** 95% do vídeo deve ser assistido para conclusão
- **Navegação Sequencial:** Próximo módulo só libera após conclusão

## 🏆 Status do Projeto

### ✅ Implementado (99% Funcional)
- Sistema de usuários e autenticação
- Gestão completa de equipamentos
- Player anti-burla com controle rigoroso
- Sistema de certificação em PDF
- Email automático configurado
- Interface administrativa completa
- Relatórios e dashboard funcionais

### 🔄 Em Desenvolvimento
- Testes automatizados
- Otimizações de performance
- Melhorias de UX/UI

### 🚀 Roadmap Futuro
- App mobile nativo
- Sistema de gamificação
- Integração com CRM
- Suporte multilingual

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Projeto:** GSLearning
- **Versão:** 1.0.0 Alpha
- **Status:** 99% Funcional
- **Última Atualização:** Julho 2025

---

**📝 Nota:** Este projeto segue a filosofia de desenvolvimento "Uma coisa de cada vez, 1% hoje, 1% a cada dia" para garantir qualidade e estabilidade.