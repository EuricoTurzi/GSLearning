"""
Views para o sistema de contas/autenticação - VERSÃO ATUALIZADA
Implementação do sistema Cliente ↔ Equipamentos
"""

# GSLEARNING - accounts/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib import messages
from django.views.generic import TemplateView, ListView, CreateView, UpdateView, DetailView
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.utils.decorators import method_decorator
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.db.models import Q, Max
from django import forms
from .utils import send_welcome_email, generate_secure_password

# Importar models
from .models import User, ClientProfile
from equipment.models import Equipment, ClientEquipment


class AdminRequiredMixin(UserPassesTestMixin):
    """Mixin para verificar se o usuário é admin"""
    
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_admin


class LoginView(TemplateView):
    """View de login customizada - ATUALIZADA para detectar primeiro acesso"""
    template_name = 'accounts/login.html'
    
    def get(self, request, *args, **kwargs):
        # Se já está logado, redireciona para o dashboard
        if request.user.is_authenticated:
            return redirect('accounts:dashboard')
        return super().get(request, *args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        if username and password:
            user = authenticate(request, username=username, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    # Atualiza último acesso se o método existir
                    if hasattr(user, 'update_last_access'):
                        user.update_last_access()
                    
                    # NOVA LÓGICA: Verificar se é primeiro login
                    if user.is_first_login:
                        messages.info(request, '🔒 Por favor, altere sua senha temporária para uma senha pessoal.')
                        return redirect('accounts:first_password_change')
                    else:
                        messages.success(request, f'Bem-vindo, {user.get_full_name() or user.username}!')
                        return redirect('accounts:dashboard')
                else:
                    messages.error(request, 'Sua conta está desativada.')
            else:
                messages.error(request, 'Usuário ou senha incorretos.')
        else:
            messages.error(request, 'Por favor, preencha todos os campos.')
        
        return self.get(request, *args, **kwargs)

@login_required
def logout_view(request):
    """Logout do usuário"""
    logout(request)
    messages.info(request, 'Você foi desconectado com sucesso.')
    return redirect('accounts:login')


class DashboardView(LoginRequiredMixin, TemplateView):
    """Dashboard principal - VERSÃO CORRIGIDA SEM LOADING"""
    
    def get_template_names(self):
        """Retorna o template correto baseado no tipo de usuário"""
        if self.request.user.user_type == 'admin':
            # Admin vai para o dashboard específico
            return ['admin/dashboard.html']
        else:
            # Cliente vai para o dashboard cliente
            return ['accounts/dashboard.html']
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        
        if self.request.user.user_type == 'admin':
            # REDIRECIONAR PARA AdminDashboardView ao invés de processar aqui
            return context
        else:
            # DADOS LEVES PARA CLIENTE (sem queries pesadas)
            context.update(self.get_client_stats())
        
        return context
    
    def get(self, request, *args, **kwargs):
        """Override para redirecionar admin para dashboard específico"""
        if request.user.user_type == 'admin':
            # Redirecionar admin para o dashboard específico
            from django.shortcuts import redirect
            return redirect('accounts:admin_dashboard')
        
        return super().get(request, *args, **kwargs)
    
    def get_client_stats(self):
        """Estatísticas para cliente - VERSÃO CORRIGIDA"""
        from training.models import TrainingModule, TrainingProgress
        from certificates.models import Certificate
        from equipment.models import Equipment, ClientEquipment
        from django.db.models import Count, Q
        from django.utils import timezone
        from datetime import timedelta
        
        user = self.request.user
        
        try:
            # ===== EQUIPAMENTOS DO CLIENTE =====
            # Equipamentos associados ao cliente
            client_equipments = ClientEquipment.objects.filter(
                client=user,
                is_active=True
            ).select_related('equipment')
            
            available_equipment = client_equipments.count()
            
            # ===== PROGRESSO GERAL =====
            # Total de módulos disponíveis para o cliente
            total_modules = 0
            completed_modules = 0
            
            for client_equipment in client_equipments:
                equipment = client_equipment.equipment
                
                # Módulos do equipamento
                equipment_modules = TrainingModule.objects.filter(
                    equipment=equipment,
                    is_active=True
                ).count()
                
                total_modules += equipment_modules
                
                # Módulos concluídos pelo cliente
                completed_equipment_modules = TrainingProgress.objects.filter(
                    client=user,
                    module__equipment=equipment,
                    status='completed'
                ).count()
                
                completed_modules += completed_equipment_modules
            
            # Calcular porcentagem de progresso
            completion_percentage = 0
            if total_modules > 0:
                completion_percentage = round((completed_modules / total_modules) * 100)
            
            # ===== CERTIFICADOS =====
            # Certificados válidos do cliente
            certificates_earned = Certificate.objects.filter(
                client=user,
                is_valid=True
            ).count()
            
            # ===== EQUIPAMENTOS COM PROGRESSO =====
            user_equipment = []
            
            for client_equipment in client_equipments[:6]:  # Máximo 6 para o dashboard
                equipment = client_equipment.equipment
                
                # Módulos totais do equipamento
                equipment_total_modules = TrainingModule.objects.filter(
                    equipment=equipment,
                    is_active=True
                ).count()
                
                # Módulos concluídos pelo cliente
                equipment_completed_modules = TrainingProgress.objects.filter(
                    client=user,
                    module__equipment=equipment,
                    status='completed'
                ).count()
                
                # Calcular progresso do equipamento
                equipment_progress = 0
                if equipment_total_modules > 0:
                    equipment_progress = round((equipment_completed_modules / equipment_total_modules) * 100)
                
                # Adicionar progresso ao equipamento
                equipment.progress_percentage = equipment_progress
                user_equipment.append(equipment)
            
            # ===== ATIVIDADES RECENTES =====
            # Últimas 5 atividades do cliente
            recent_progress = []
            
            recent_trainings = TrainingProgress.objects.filter(
                client=user
            ).select_related('module', 'module__equipment').order_by('-updated_at')[:5]
            
            for progress in recent_trainings:
                recent_progress.append({
                    'title': f"Módulo: {progress.module.title}",
                    'equipment_name': progress.module.equipment.name,
                    'date': progress.updated_at,
                    'status': progress.status,
                    'percentage': progress.progress_percentage if hasattr(progress, 'progress_percentage') else 0
                })
            
            # ===== CONTEXTO PARA O TEMPLATE =====
            context = {
                'client_stats': {
                    'available_equipment': available_equipment,
                    'completion_percentage': completion_percentage,
                    'certificates_earned': certificates_earned,
                    'total_modules': total_modules,
                    'completed_modules': completed_modules,
                },
                'user_equipment': user_equipment,
                'recent_progress': recent_progress,
            }
            
            return context
            
        except Exception as e:
            # Log do erro para debug
            print(f"Erro ao carregar stats do cliente: {e}")
            
            # Retornar valores padrão em caso de erro
            return {
                'client_stats': {
                    'available_equipment': 0,
                    'completion_percentage': 0,
                    'certificates_earned': 0,
                    'total_modules': 0,
                    'completed_modules': 0,
                },
                'user_equipment': [],
                'recent_progress': [],
            }

# ===== VIEWS ADMINISTRATIVAS - GESTÃO DE CLIENTES =====

class ClientForm(forms.ModelForm):
    """Formulário para cadastro/edição de clientes"""
    
    equipments = forms.ModelMultipleChoiceField(
        queryset=Equipment.objects.filter(is_active=True),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label='Equipamentos Disponíveis',
        help_text='Selecione os equipamentos que este cliente possui'
    )
    
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'company', 'phone', 'is_active_client']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Se está editando um cliente existente, marcar equipamentos já associados
        if self.instance.pk:
            self.fields['equipments'].initial = Equipment.objects.filter(
                equipment_clients__client=self.instance
            )


class ClientListView(LoginRequiredMixin, AdminRequiredMixin, ListView):
    """Lista de clientes para administração"""
    model = User
    template_name = 'accounts/client_list.html'
    context_object_name = 'clients'
    paginate_by = 20
    
    def get_queryset(self):
        queryset = User.objects.filter(user_type='client').order_by('-created_at')
        
        # Filtro de busca
        search = self.request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(company__icontains=search)
            )
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['search'] = self.request.GET.get('search', '')
        return context


class ClientCreateView(LoginRequiredMixin, AdminRequiredMixin, CreateView):
    """Criação de novo cliente - ATUALIZADA COM SENHA SIMPLES"""
    model = User
    form_class = ClientForm
    template_name = 'accounts/client_form.html'
    success_url = reverse_lazy('accounts:client_list')
    
    def form_valid(self, form):
        # Definir como cliente
        form.instance.user_type = 'client'
        
        # NOVA FUNCIONALIDADE: Gerar senha simples automaticamente
        simple_password = generate_secure_password(length=8)
        form.instance.set_password(simple_password)
        
        response = super().form_valid(form)
        
        # Associar equipamentos selecionados
        equipments = form.cleaned_data.get('equipments', [])
        for equipment in equipments:
            ClientEquipment.objects.get_or_create(
                client=self.object,
                equipment=equipment
            )
        
        # Enviar email de boas-vindas com nova senha simples
        email_sent = send_welcome_email(self.object, simple_password)
        
        if email_sent:
            messages.success(
                self.request, 
                f'✅ Cliente "{self.object.get_full_name() or self.object.username}" criado com sucesso! '
                f'📧 Email com credenciais enviado para {self.object.email}'
            )
        else:
            messages.success(
                self.request, 
                f'✅ Cliente "{self.object.get_full_name() or self.object.username}" criado com sucesso! '
                f'🔒 Senha temporária: {simple_password} (Email não pôde ser enviado)'
            )
        
        return response
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Novo Cliente'
        return context

class ClientEditView(LoginRequiredMixin, AdminRequiredMixin, UpdateView):
    """Edição de cliente existente"""
    model = User
    form_class = ClientForm
    template_name = 'accounts/client_form.html'
    success_url = reverse_lazy('accounts:client_list')
    
    def get_queryset(self):
        # Apenas clientes
        return User.objects.filter(user_type='client')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        
        # Atualizar associações de equipamentos
        equipments = form.cleaned_data.get('equipments', [])
        
        # Remover associações antigas
        ClientEquipment.objects.filter(client=self.object).delete()
        
        # Criar novas associações
        for equipment in equipments:
            ClientEquipment.objects.create(
                client=self.object,
                equipment=equipment
            )
        
        messages.success(
            self.request, 
            f'Cliente "{self.object.get_full_name() or self.object.username}" atualizado com sucesso!'
        )
        
        return response
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = f'Editar: {self.object.get_full_name() or self.object.username}'
        return context


class ClientDetailView(LoginRequiredMixin, AdminRequiredMixin, DetailView):
    """Detalhes do cliente"""
    model = User
    template_name = 'accounts/client_detail.html'
    context_object_name = 'client'
    
    def get_queryset(self):
        return User.objects.filter(user_type='client')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        client = self.object
        
        # Equipamentos do cliente
        client_equipments = ClientEquipment.objects.filter(
            client=client,
            is_active=True
        ).select_related('equipment', 'equipment__category')
        
        # Progresso por equipamento
        from training.models import TrainingProgress
        equipment_progress = []
        
        for client_equipment in client_equipments:
            equipment = client_equipment.equipment
            
            # Módulos totais
            total_modules = equipment.training_modules.filter(is_active=True).count()
            
            # Módulos concluídos
            completed_modules = TrainingProgress.objects.filter(
                client=client,
                module__equipment=equipment,
                status='completed'
            ).count()
            
            # Calcular progresso
            if total_modules > 0:
                progress_percentage = (completed_modules / total_modules) * 100
            else:
                progress_percentage = 0
            
            equipment_progress.append({
                'equipment': equipment,
                'total_modules': total_modules,
                'completed_modules': completed_modules,
                'progress_percentage': progress_percentage,
                'assigned_at': client_equipment.assigned_at,
            })
        
        context['equipment_progress'] = equipment_progress
        context['total_equipments'] = len(equipment_progress)
        
        return context
    
class AdminDashboardView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    """Dashboard administrativo com estatísticas completas"""
    template_name = 'admin/dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Importações necessárias
        from training.models import TrainingModule, TrainingProgress, EquipmentTrainingProgress
        from certificates.models import Certificate
        from equipment.models import Equipment, EquipmentCategory
        from django.db.models import Count, Avg, Sum
        from django.utils import timezone
        from datetime import timedelta
        
        # ===== ESTATÍSTICAS GERAIS =====
        context['total_clients'] = User.objects.filter(user_type='client').count()
        context['total_equipments'] = Equipment.objects.filter(is_active=True).count()
        context['total_modules'] = TrainingModule.objects.filter(is_active=True).count()
        context['total_certificates'] = Certificate.objects.filter(is_valid=True).count()
        
        # ===== ATIVIDADE RECENTE (últimos 7 dias) =====
        last_week = timezone.now() - timedelta(days=7)
        context['new_clients_week'] = User.objects.filter(
            user_type='client', 
            created_at__gte=last_week
        ).count()
        context['certificates_week'] = Certificate.objects.filter(
            issued_at__gte=last_week
        ).count()
        
        # ===== PROGRESSO DOS TREINAMENTOS =====
        total_possible_progress = User.objects.filter(user_type='client').count() * Equipment.objects.count()
        completed_trainings = EquipmentTrainingProgress.objects.filter(
            completed_at__isnull=False
        ).count()
        
        if total_possible_progress > 0:
            context['overall_completion_rate'] = (completed_trainings / total_possible_progress) * 100
        else:
            context['overall_completion_rate'] = 0
        
        # ===== CLIENTES ATIVOS =====
        context['active_clients'] = User.objects.filter(
            user_type='client',
            last_access__gte=last_week
        ).count()
        
        # ===== EQUIPAMENTOS MAIS POPULARES =====
        context['popular_equipments'] = Equipment.objects.annotate(
            progress_count=Count('client_progress')
        ).order_by('-progress_count')[:5]
        
        # ===== ÚLTIMOS CERTIFICADOS =====
        context['recent_certificates'] = Certificate.objects.select_related(
            'client', 'equipment'
        ).order_by('-issued_at')[:5]
        
        # ===== CLIENTES RECENTES =====
        context['recent_clients'] = User.objects.filter(
            user_type='client'
        ).order_by('-created_at')[:5]
        
        return context

class FirstPasswordChangeForm(forms.Form):
    """Formulário especial para primeiro acesso - NÃO pede senha atual"""
    
    new_password1 = forms.CharField(
        label='Nova Senha',
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
            'placeholder': 'Digite sua nova senha'
        }),
        help_text='Crie uma senha pessoal para substituir a senha temporária.'
    )
    
    new_password2 = forms.CharField(
        label='Confirmar Nova Senha',
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
            'placeholder': 'Confirme sua nova senha'
        })
    )
    
    def clean_new_password2(self):
        """Validar se as duas senhas são iguais"""
        password1 = self.cleaned_data.get('new_password1')
        password2 = self.cleaned_data.get('new_password2')
        
        if password1 and password2:
            if password1 != password2:
                raise forms.ValidationError('As senhas não coincidem.')
        
        return password2
    
    def save(self, user):
        """Salvar a nova senha e marcar que não é mais primeiro login"""
        password = self.cleaned_data['new_password1']
        user.set_password(password)
        user.is_first_login = False  # IMPORTANTE: marcar que já alterou
        user.save()
        return user


# Adicionar esta view:

@method_decorator(login_required, name='dispatch')
class FirstPasswordChangeView(TemplateView):
    """View especial para primeiro acesso - só pede nova senha"""
    template_name = 'accounts/first_password_change.html'
    
    def dispatch(self, request, *args, **kwargs):
        # Só permite acesso se realmente for primeiro login
        if not request.user.is_first_login:
            messages.info(request, 'Você já alterou sua senha inicial.')
            return redirect('accounts:dashboard')
        return super().dispatch(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form'] = FirstPasswordChangeForm()
        return context
    
    def post(self, request, *args, **kwargs):
        form = FirstPasswordChangeForm(data=request.POST)
        
        if form.is_valid():
            # Salvar nova senha e marcar como "não é mais primeiro login"
            user = form.save(request.user)
            
            # Manter usuário logado após alterar senha
            update_session_auth_hash(request, user)
            
            messages.success(request, '🎉 Senha alterada com sucesso! Bem-vindo ao GSLearning!')
            return redirect('equipment:list')
        else:
            messages.error(request, 'Por favor, corrija os erros abaixo.')
        
        # Se teve erro, mostrar formulário com erros
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return self.render_to_response(context)

class SimplePasswordChangeForm(PasswordChangeForm):
    """Formulário simples para alteração de senha"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Customizar campos com classes CSS
        self.fields['old_password'].widget.attrs.update({
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
            'placeholder': 'Digite sua senha atual'
        })
        
        self.fields['new_password1'].widget.attrs.update({
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
            'placeholder': 'Digite sua nova senha'
        })
        
        self.fields['new_password2'].widget.attrs.update({
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
            'placeholder': 'Confirme sua nova senha'
        })
        
        # Labels em português
        self.fields['old_password'].label = 'Senha Atual'
        self.fields['new_password1'].label = 'Nova Senha'
        self.fields['new_password2'].label = 'Confirmar Nova Senha'


# Adicionar esta view nova:
@method_decorator(login_required, name='dispatch')
class PasswordChangeView(TemplateView):
    """View simples para alteração de senha"""
    template_name = 'accounts/change_password.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form'] = SimplePasswordChangeForm(user=self.request.user)
        return context
    
    def post(self, request, *args, **kwargs):
        form = SimplePasswordChangeForm(user=request.user, data=request.POST)
        
        if form.is_valid():
            # Salvar nova senha
            user = form.save()
            
            # Manter usuário logado após alterar senha
            update_session_auth_hash(request, user)
            
            messages.success(request, '🔒 Senha alterada com sucesso!')
            return redirect('accounts:dashboard')
        else:
            messages.error(request, 'Por favor, corrija os erros abaixo.')
        
        # Se teve erro, mostrar formulário com erros
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return self.render_to_response(context)
    
class ClientProgressReportView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    """Relatório detalhado de progresso por cliente"""
    template_name = 'admin/reports/client_progress.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Importações necessárias
        from training.models import TrainingProgress, EquipmentTrainingProgress
        from equipment.models import ClientEquipment
        from django.db.models import Count, Avg, Q
        
        # Filtros da URL
        status_filter = self.request.GET.get('status', 'all')
        search = self.request.GET.get('search', '')
        
        # Buscar todos os clientes
        clients = User.objects.filter(user_type='client')
        
        # Aplicar filtro de busca
        if search:
            clients = clients.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(company__icontains=search)
            )
        
        # Preparar dados do relatório
        client_data = []
        
        for client in clients:
            # Equipamentos do cliente
            client_equipments = ClientEquipment.objects.filter(
                client=client,
                is_active=True
            ).select_related('equipment')
            
            total_equipments = client_equipments.count()
            equipments_data = []
            completed_equipments = 0
            in_progress_equipments = 0
            not_started_equipments = 0
            
            for client_equipment in client_equipments:
                equipment = client_equipment.equipment
                
                # Módulos totais do equipamento
                total_modules = equipment.training_modules.filter(is_active=True).count()
                
                # Módulos concluídos pelo cliente
                completed_modules = TrainingProgress.objects.filter(
                    client=client,
                    module__equipment=equipment,
                    status='completed'
                ).count()
                
                # Calcular progresso
                if total_modules > 0:
                    progress_percentage = (completed_modules / total_modules) * 100
                else:
                    progress_percentage = 0
                
                # Determinar status
                if progress_percentage >= 100:
                    status = 'completed'
                    completed_equipments += 1
                elif progress_percentage > 0:
                    status = 'in_progress'
                    in_progress_equipments += 1
                else:
                    status = 'not_started'
                    not_started_equipments += 1
                
                # Último acesso ao equipamento
                last_progress = TrainingProgress.objects.filter(
                    client=client,
                    module__equipment=equipment
                ).order_by('-updated_at').first()
                
                equipments_data.append({
                    'equipment': equipment,
                    'total_modules': total_modules,
                    'completed_modules': completed_modules,
                    'progress_percentage': progress_percentage,
                    'status': status,
                    'last_access': last_progress.updated_at if last_progress else None,
                    'assigned_at': client_equipment.assigned_at,
                })
            
            # Calcular progresso geral do cliente
            if total_equipments > 0:
                client_overall_progress = (completed_equipments / total_equipments) * 100
            else:
                client_overall_progress = 0
            
            # Determinar status geral do cliente
            if completed_equipments == total_equipments and total_equipments > 0:
                client_status = 'completed'
            elif in_progress_equipments > 0 or completed_equipments > 0:
                client_status = 'in_progress'
            else:
                client_status = 'not_started'
            
            client_info = {
                'client': client,
                'total_equipments': total_equipments,
                'completed_equipments': completed_equipments,
                'in_progress_equipments': in_progress_equipments,
                'not_started_equipments': not_started_equipments,
                'overall_progress': client_overall_progress,
                'status': client_status,
                'equipments': equipments_data,
                'last_activity': max([eq['last_access'] for eq in equipments_data if eq['last_access']], default=None)
            }
            
            # Aplicar filtro de status
            if status_filter == 'all' or client_info['status'] == status_filter:
                client_data.append(client_info)
        
        # Ordenar por progresso (concluídos primeiro, depois por progresso)
        client_data.sort(key=lambda x: (-x['overall_progress'], x['client'].get_full_name() or x['client'].username))
        
        # Estatísticas gerais
        total_clients = len(client_data)
        completed_clients = len([c for c in client_data if c['status'] == 'completed'])
        in_progress_clients = len([c for c in client_data if c['status'] == 'in_progress'])
        not_started_clients = len([c for c in client_data if c['status'] == 'not_started'])
        
        context.update({
            'client_data': client_data,
            'total_clients': total_clients,
            'completed_clients': completed_clients,
            'in_progress_clients': in_progress_clients,
            'not_started_clients': not_started_clients,
            'status_filter': status_filter,
            'search': search,
            'completion_rate': (completed_clients / total_clients * 100) if total_clients > 0 else 0,
        })
        
        return context
    
class EquipmentAnalyticsView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    """Relatório de analytics dos equipamentos"""
    template_name = 'admin/reports/equipment_analytics.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Importações necessárias
        from training.models import TrainingProgress, EquipmentTrainingProgress
        from equipment.models import Equipment, ClientEquipment, EquipmentCategory
        from django.db.models import Count, Avg, Sum, Q
        from django.utils import timezone
        from datetime import timedelta
        
        # Filtros da URL
        category_filter = self.request.GET.get('category', 'all')
        period_filter = self.request.GET.get('period', 'all')  # all, week, month
        
        # Filtro de período
        date_filter = None
        if period_filter == 'week':
            date_filter = timezone.now() - timedelta(days=7)
        elif period_filter == 'month':
            date_filter = timezone.now() - timedelta(days=30)
        
        # Buscar todos os equipamentos
        equipments = Equipment.objects.filter(is_active=True)
        
        # Aplicar filtro de categoria
        if category_filter != 'all':
            equipments = equipments.filter(category_id=category_filter)
        
        # Preparar dados dos equipamentos
        equipment_data = []
        
        for equipment in equipments:
            # Clientes que têm este equipamento
            total_clients_with_equipment = ClientEquipment.objects.filter(
                equipment=equipment,
                is_active=True
            ).count()
            
            # Total de módulos do equipamento
            total_modules = equipment.training_modules.filter(is_active=True).count()
            
            # Progresso dos treinamentos
            progress_query = TrainingProgress.objects.filter(
                module__equipment=equipment
            )
            
            # Aplicar filtro de período se necessário
            if date_filter:
                progress_query = progress_query.filter(updated_at__gte=date_filter)
            
            # Clientes que iniciaram o treinamento
            clients_started = progress_query.values('client').distinct().count()
            
            # Clientes que concluíram módulos
            clients_with_completed_modules = progress_query.filter(
                status='completed'
            ).values('client').distinct().count()
            
            # Clientes que concluíram TODO o treinamento do equipamento
            clients_completed_equipment = EquipmentTrainingProgress.objects.filter(
                equipment=equipment,
                completed_at__isnull=False
            )
            if date_filter:
                clients_completed_equipment = clients_completed_equipment.filter(
                    completed_at__gte=date_filter
                )
            clients_completed_count = clients_completed_equipment.count()
            
            # Calcular métricas
            usage_rate = (clients_started / total_clients_with_equipment * 100) if total_clients_with_equipment > 0 else 0
            completion_rate = (clients_completed_count / total_clients_with_equipment * 100) if total_clients_with_equipment > 0 else 0
            
            # Tempo médio de conclusão (em dias)
            completed_trainings = clients_completed_equipment.filter(
                started_at__isnull=False,
                completed_at__isnull=False
            )
            
            avg_completion_time = None
            if completed_trainings.exists():
                total_time = sum([
                    (training.completed_at - training.started_at).days 
                    for training in completed_trainings
                ])
                avg_completion_time = total_time / completed_trainings.count()
            
            # Módulos com mais dificuldade (menor taxa de conclusão)
            module_stats = []
            for module in equipment.training_modules.filter(is_active=True):
                module_progress = TrainingProgress.objects.filter(module=module)
                if date_filter:
                    module_progress = module_progress.filter(updated_at__gte=date_filter)
                
                total_attempts = module_progress.count()
                completed_attempts = module_progress.filter(status='completed').count()
                module_completion_rate = (completed_attempts / total_attempts * 100) if total_attempts > 0 else 0
                
                module_stats.append({
                    'module': module,
                    'attempts': total_attempts,
                    'completion_rate': module_completion_rate
                })
            
            # Ordenar módulos por dificuldade (menor taxa de conclusão primeiro)
            module_stats.sort(key=lambda x: x['completion_rate'])
            
            # Atividade recente
            recent_activity = progress_query.filter(
                updated_at__gte=timezone.now() - timedelta(days=7)
            ).count()
            
            equipment_info = {
                'equipment': equipment,
                'total_clients': total_clients_with_equipment,
                'clients_started': clients_started,
                'clients_completed': clients_completed_count,
                'usage_rate': usage_rate,
                'completion_rate': completion_rate,
                'avg_completion_time': avg_completion_time,
                'total_modules': total_modules,
                'module_stats': module_stats[:3],  # Top 3 módulos com dificuldade
                'recent_activity': recent_activity,
                'difficulty_score': 100 - completion_rate if completion_rate > 0 else 0
            }
            
            equipment_data.append(equipment_info)
        
        # Ordenar por diferentes critérios
        sort_by = self.request.GET.get('sort', 'usage')
        if sort_by == 'usage':
            equipment_data.sort(key=lambda x: x['usage_rate'], reverse=True)
        elif sort_by == 'completion':
            equipment_data.sort(key=lambda x: x['completion_rate'], reverse=True)
        elif sort_by == 'difficulty':
            equipment_data.sort(key=lambda x: x['difficulty_score'], reverse=True)
        elif sort_by == 'activity':
            equipment_data.sort(key=lambda x: x['recent_activity'], reverse=True)
        
        # Estatísticas gerais
        total_equipments = len(equipment_data)
        total_usage = sum([eq['clients_started'] for eq in equipment_data])
        total_completions = sum([eq['clients_completed'] for eq in equipment_data])
        avg_completion_rate = sum([eq['completion_rate'] for eq in equipment_data]) / total_equipments if total_equipments > 0 else 0
        
        # Top equipamentos por categoria
        popular_by_category = {}
        for category in EquipmentCategory.objects.filter(is_active=True):
            category_equipment = [eq for eq in equipment_data if eq['equipment'].category == category]
            if category_equipment:
                most_popular = max(category_equipment, key=lambda x: x['usage_rate'])
                popular_by_category[category.name] = most_popular
        
        # Categorias para filtro
        categories = EquipmentCategory.objects.filter(is_active=True)
        
        context.update({
            'equipment_data': equipment_data,
            'total_equipments': total_equipments,
            'total_usage': total_usage,
            'total_completions': total_completions,
            'avg_completion_rate': avg_completion_rate,
            'popular_by_category': popular_by_category,
            'categories': categories,
            'category_filter': category_filter,
            'period_filter': period_filter,
            'sort_by': sort_by,
        })
        
        return context
    
class CertificateReportView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    """Relatório detalhado de certificados emitidos"""
    template_name = 'admin/reports/certificate_report.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Importações necessárias
        from certificates.models import Certificate
        from equipment.models import Equipment, EquipmentCategory
        from django.db.models import Count, Sum, Q
        from django.utils import timezone
        from datetime import timedelta, datetime
        import calendar
        
        # Filtros da URL
        period_filter = self.request.GET.get('period', 'all')  # all, week, month, year
        category_filter = self.request.GET.get('category', 'all')
        equipment_filter = self.request.GET.get('equipment', 'all')
        
        # Filtro de período
        certificates = Certificate.objects.filter(is_valid=True)
        date_filter = None
        
        if period_filter == 'week':
            date_filter = timezone.now() - timedelta(days=7)
        elif period_filter == 'month':
            date_filter = timezone.now() - timedelta(days=30)
        elif period_filter == 'year':
            date_filter = timezone.now() - timedelta(days=365)
        
        if date_filter:
            certificates = certificates.filter(issued_at__gte=date_filter)
        
        # Aplicar filtros de categoria e equipamento
        if category_filter != 'all':
            certificates = certificates.filter(equipment__category_id=category_filter)
        
        if equipment_filter != 'all':
            certificates = certificates.filter(equipment_id=equipment_filter)
        
        # Estatísticas gerais
        total_certificates = certificates.count()
        total_downloads = certificates.aggregate(total=Sum('download_count'))['total'] or 0
        unique_clients = certificates.values('client').distinct().count()
        
        # Certificados por mês (últimos 12 meses)
        monthly_data = []
        for i in range(12):
            month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=32*i)
            month_end = month_start.replace(day=calendar.monthrange(month_start.year, month_start.month)[1], 
                                          hour=23, minute=59, second=59)
            
            monthly_count = Certificate.objects.filter(
                is_valid=True,
                issued_at__gte=month_start,
                issued_at__lte=month_end
            ).count()
            
            monthly_data.append({
                'month': month_start.strftime('%b/%y'),
                'count': monthly_count,
                'month_start': month_start
            })
        
        # Reverter para ordem cronológica
        monthly_data.reverse()
        
        # Top equipamentos por certificados
        equipment_stats = certificates.values(
            'equipment__name', 
            'equipment__category__name', 
            'equipment__model',
            'equipment_id'
        ).annotate(
            certificate_count=Count('id'),
            total_downloads=Sum('download_count'),
            unique_clients=Count('client', distinct=True)
        ).order_by('-certificate_count')[:10]
        
        # Top clientes por certificados
        client_stats = certificates.values(
            'client__username',
            'client__first_name', 
            'client__last_name',
            'client__company',
            'client_id'
        ).annotate(
            certificate_count=Count('id'),
            total_downloads=Sum('download_count'),
            latest_certificate=Max('issued_at')
        ).order_by('-certificate_count')[:10]
        
        # Certificados recentes (últimos 20)
        recent_certificates = certificates.select_related(
            'client', 'equipment', 'equipment__category'
        ).order_by('-issued_at')[:20]
        
        # Estatísticas de download
        certificates_with_downloads = certificates.filter(download_count__gt=0).count()
        certificates_without_downloads = total_certificates - certificates_with_downloads
        avg_downloads = total_downloads / total_certificates if total_certificates > 0 else 0
        
        # Certificados mais baixados
        most_downloaded = certificates.order_by('-download_count')[:5]
        
        # Análise por categoria
        category_stats = certificates.values(
            'equipment__category__name'
        ).annotate(
            certificate_count=Count('id'),
            unique_equipments=Count('equipment', distinct=True),
            total_downloads=Sum('download_count')
        ).order_by('-certificate_count')
        
        # Análise temporal (certificados por dia da semana)
        weekday_stats = []
        weekdays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
        
        for i in range(7):
            count = certificates.extra(
                where=["EXTRACT(dow FROM issued_at) = %s"],
                params=[i+1]  # PostgreSQL: Sunday=0, Monday=1
            ).count()
            weekday_stats.append({
                'day': weekdays[i],
                'count': count
            })
        
        # Taxa de certificação (certificados vs clientes totais)
        total_clients = User.objects.filter(user_type='client').count()
        certification_rate = (unique_clients / total_clients * 100) if total_clients > 0 else 0
        
        # Equipamentos e categorias para filtros
        equipments_for_filter = Equipment.objects.filter(is_active=True).order_by('name')
        categories_for_filter = EquipmentCategory.objects.filter(is_active=True).order_by('name')
        
        context.update({
            'certificates': recent_certificates,
            'total_certificates': total_certificates,
            'total_downloads': total_downloads,
            'unique_clients': unique_clients,
            'avg_downloads': avg_downloads,
            'certificates_with_downloads': certificates_with_downloads,
            'certificates_without_downloads': certificates_without_downloads,
            'monthly_data': monthly_data,
            'equipment_stats': equipment_stats,
            'client_stats': client_stats,
            'most_downloaded': most_downloaded,
            'category_stats': category_stats,
            'weekday_stats': weekday_stats,
            'certification_rate': certification_rate,
            'total_clients': total_clients,
            
            # Filtros
            'period_filter': period_filter,
            'category_filter': category_filter,
            'equipment_filter': equipment_filter,
            'equipments_for_filter': equipments_for_filter,
            'categories_for_filter': categories_for_filter,
        })
        
        return context
    
class AdminTimeMetricsReportView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    """Relatório detalhado de métricas de tempo de treinamento"""
    template_name = 'admin/reports/time_metrics.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Importações necessárias
        from training.models import TrainingProgress, EquipmentTrainingProgress
        from equipment.models import Equipment, ClientEquipment, EquipmentCategory
        from certificates.models import Certificate
        from django.db.models import Count, Avg, Sum, Q, Min, Max
        from django.utils import timezone
        from datetime import timedelta, datetime
        import calendar
        
        # Filtros da URL
        period_filter = self.request.GET.get('period', 'all')  # all, week, month, year
        category_filter = self.request.GET.get('category', 'all')
        equipment_filter = self.request.GET.get('equipment', 'all')
        metric_type = self.request.GET.get('metric', 'completion')  # completion, watch_time, efficiency
        
        # ===== FILTRO DE PERÍODO =====
        base_queryset = TrainingProgress.objects.all()
        date_filter = None
        
        if period_filter == 'week':
            date_filter = timezone.now() - timedelta(days=7)
        elif period_filter == 'month':
            date_filter = timezone.now() - timedelta(days=30)
        elif period_filter == 'year':
            date_filter = timezone.now() - timedelta(days=365)
        
        if date_filter:
            base_queryset = base_queryset.filter(updated_at__gte=date_filter)
        
        # Aplicar filtros de categoria e equipamento
        if category_filter != 'all':
            base_queryset = base_queryset.filter(module__equipment__category_id=category_filter)
        
        if equipment_filter != 'all':
            base_queryset = base_queryset.filter(module__equipment_id=equipment_filter)
        
        # ===== ESTATÍSTICAS GERAIS DE TEMPO =====
        # Tempo total assistido (em horas)
        total_watch_time_seconds = base_queryset.aggregate(
            total=Sum('watch_time_seconds')
        )['total'] or 0
        total_watch_time_hours = round(total_watch_time_seconds / 3600, 1)
        
        # Tempo médio de conclusão por módulo (em minutos)
        completed_modules_queryset = base_queryset.filter(status='completed')
        avg_completion_time = completed_modules_queryset.aggregate(
            avg=Avg('watch_time_seconds')
        )['avg'] or 0
        avg_completion_minutes = round(avg_completion_time / 60, 1)
        
        # Tempo médio para primeiro acesso ao completar
        completion_data = completed_modules_queryset.values('client', 'module').annotate(
            first_access=Min('created_at'),
            completion_date=Max('updated_at')
        )
        
        total_days_to_complete = 0
        for data in completion_data:
            if data['first_access'] and data['completion_date']:
                days_diff = (data['completion_date'].date() - data['first_access'].date()).days
                total_days_to_complete += days_diff
        
        avg_days_to_complete = round(total_days_to_complete / len(completion_data), 1) if completion_data else 0
        
        # ===== ANÁLISE POR EQUIPAMENTO =====
        equipment_metrics = []
        equipments = Equipment.objects.filter(is_active=True)
        
        if category_filter != 'all':
            equipments = equipments.filter(category_id=category_filter)
        if equipment_filter != 'all':
            equipments = equipments.filter(id=equipment_filter)
        
        for equipment in equipments:
            equipment_progress = base_queryset.filter(module__equipment=equipment)
            
            # Estatísticas básicas
            total_modules = equipment.training_modules.filter(is_active=True).count()
            completed_count = equipment_progress.filter(status='completed').count()
            in_progress_count = equipment_progress.filter(status='in_progress').count()
            
            # Tempo médio por módulo deste equipamento
            avg_time_seconds = equipment_progress.aggregate(
                avg=Avg('watch_time_seconds')
            )['avg'] or 0
            avg_time_minutes = round(avg_time_seconds / 60, 1)
            
            # Tempo total do equipamento (duração esperada vs tempo real)
            expected_duration = equipment.training_modules.filter(is_active=True).aggregate(
                total=Sum('duration_seconds')
            )['total'] or 0
            actual_watch_time = equipment_progress.aggregate(
                total=Sum('watch_time_seconds')
            )['total'] or 0
            
            # Calcular eficiência (%)
            efficiency = 0
            if expected_duration > 0:
                efficiency = round((expected_duration / actual_watch_time) * 100, 1) if actual_watch_time > 0 else 0
            
            # Determinar nível de dificuldade baseado na eficiência
            if efficiency >= 90:
                difficulty_level = "Fácil"
                difficulty_color = "green"
            elif efficiency >= 70:
                difficulty_level = "Médio"
                difficulty_color = "yellow"
            else:
                difficulty_level = "Difícil"
                difficulty_color = "red"
            
            equipment_metrics.append({
                'equipment': equipment,
                'total_modules': total_modules,
                'completed_count': completed_count,
                'in_progress_count': in_progress_count,
                'avg_time_minutes': avg_time_minutes,
                'expected_duration_minutes': round(expected_duration / 60, 1),
                'actual_time_minutes': round(actual_watch_time / 60, 1),
                'efficiency': efficiency,
                'difficulty_level': difficulty_level,
                'difficulty_color': difficulty_color,
                'completion_rate': round((completed_count / total_modules * 100), 1) if total_modules > 0 else 0,
            })
        
        # Ordenar por eficiência ou tempo conforme métrica selecionada
        if metric_type == 'efficiency':
            equipment_metrics.sort(key=lambda x: x['efficiency'], reverse=True)
        elif metric_type == 'watch_time':
            equipment_metrics.sort(key=lambda x: x['actual_time_minutes'], reverse=True)
        else:  # completion
            equipment_metrics.sort(key=lambda x: x['completion_rate'], reverse=True)
        
        # ===== ANÁLISE DE HORÁRIOS DE PICO =====
        # Análise por hora do dia (quando os usuários mais assistem)
        hourly_activity = {}
        for hour in range(24):
            count = base_queryset.filter(
                updated_at__hour=hour
            ).count()
            hourly_activity[f"{hour:02d}:00"] = count
        
        # Encontrar horário de pico
        peak_hour = max(hourly_activity.items(), key=lambda x: x[1]) if hourly_activity else ("N/A", 0)
        
        # ===== CLIENTES MAIS E MENOS EFICIENTES =====
        client_efficiency = []
        clients = User.objects.filter(user_type='client')
        
        for client in clients:
            client_progress = base_queryset.filter(client=client)
            
            if client_progress.exists():
                total_expected = 0
                total_actual = 0
                completed_modules = 0
                
                for progress in client_progress:
                    module_duration = progress.module.duration_seconds
                    total_expected += module_duration
                    total_actual += progress.watch_time_seconds
                    if progress.status == 'completed':
                        completed_modules += 1
                
                efficiency = round((total_expected / total_actual) * 100, 1) if total_actual > 0 else 0
                
                client_efficiency.append({
                    'client': client,
                    'efficiency': efficiency,
                    'completed_modules': completed_modules,
                    'total_time_hours': round(total_actual / 3600, 1)
                })
        
        # Ordenar por eficiência
        client_efficiency.sort(key=lambda x: x['efficiency'], reverse=True)
        top_efficient_clients = client_efficiency[:5]  # Top 5 mais eficientes
        least_efficient_clients = client_efficiency[-5:]  # 5 menos eficientes
        
        # ===== TENDÊNCIAS MENSAIS =====
        monthly_trends = []
        for i in range(6):  # Últimos 6 meses
            month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=32*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
            
            month_data = base_queryset.filter(
                updated_at__gte=month_start,
                updated_at__lte=month_end
            )
            
            total_time = month_data.aggregate(total=Sum('watch_time_seconds'))['total'] or 0
            completed_count = month_data.filter(status='completed').count()
            
            monthly_trends.append({
                'month': month_start.strftime('%B %Y'),
                'total_hours': round(total_time / 3600, 1),
                'completed_modules': completed_count,
                'avg_daily_hours': round((total_time / 3600) / 30, 1)  # Aproximado por 30 dias
            })
        
        monthly_trends.reverse()  # Mais antigo para mais recente
        
        # ===== PREPARAR CONTEXTO =====
        context.update({
            # Filtros
            'period_filter': period_filter,
            'category_filter': category_filter,
            'equipment_filter': equipment_filter,
            'metric_type': metric_type,
            
            # Opções para filtros
            'categories': EquipmentCategory.objects.all(),
            'equipments': Equipment.objects.filter(is_active=True),
            
            # Estatísticas gerais
            'total_watch_time_hours': total_watch_time_hours,
            'avg_completion_minutes': avg_completion_minutes,
            'avg_days_to_complete': avg_days_to_complete,
            'total_completed_modules': completed_modules_queryset.count(),
            
            # Dados por equipamento
            'equipment_metrics': equipment_metrics,
            
            # Análise de horários
            'hourly_activity': hourly_activity,
            'peak_hour': peak_hour[0],
            'peak_hour_count': peak_hour[1],
            
            # Eficiência dos clientes
            'top_efficient_clients': top_efficient_clients,
            'least_efficient_clients': least_efficient_clients,
            
            # Tendências mensais
            'monthly_trends': monthly_trends,
            
            # Metadados
            'total_analyzed_sessions': base_queryset.count(),
        })
        
        return context