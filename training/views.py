"""
Views para o sistema de treinamento - VERSÃO COMPLETA
"""

# GSLEARNING - training/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib import messages
from django.views.generic import ListView, CreateView, UpdateView, DetailView, TemplateView
from django.urls import reverse_lazy
from django.db.models import Q, Count
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
import json

from .models import TrainingModule, TrainingProgress, EquipmentTrainingProgress
from .utils import update_progress_and_check_completion
from equipment.models import Equipment


class AdminRequiredMixin(UserPassesTestMixin):
    """Mixin para verificar se o usuário é admin"""
    
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_admin


# ===== VIEWS DO CLIENTE =====

class TrainingView(LoginRequiredMixin, DetailView):
    """Página de treinamento de um equipamento para o cliente"""
    model = Equipment
    template_name = 'training/client_equipment.html'
    context_object_name = 'equipment'
    pk_url_kwarg = 'equipment_id'
    
    def get_queryset(self):
        # Por enquanto, todos os equipamentos ativos (depois filtraremos por cliente)
        return Equipment.objects.filter(is_active=True)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        equipment = self.object
        user = self.request.user
        
        # Módulos do equipamento
        modules = TrainingModule.objects.filter(
            equipment=equipment,
            is_active=True
        ).order_by('order')
        
        # Progresso do usuário em cada módulo
        modules_with_progress = []
        for module in modules:
            try:
                progress = TrainingProgress.objects.get(
                    client=user,
                    module=module
                )
            except TrainingProgress.DoesNotExist:
                progress = None
            
            modules_with_progress.append({
                'module': module,
                'progress': progress,
                'is_completed': progress.is_completed if progress else False,
                'completion_percentage': progress.completion_percentage if progress else 0,
            })
        
        # Progresso geral do equipamento
        equipment_progress, created = EquipmentTrainingProgress.objects.get_or_create(
            client=user,
            equipment=equipment
        )
        
        context.update({
            'modules_with_progress': modules_with_progress,
            'equipment_progress': equipment_progress,
            'total_modules': len(modules_with_progress),
            'completed_modules': len([m for m in modules_with_progress if m['is_completed']]),
        })
        
        return context


class ModuleView(LoginRequiredMixin, DetailView):
    """Player de vídeo para um módulo específico"""
    model = TrainingModule
    template_name = 'training/client_module.html'
    context_object_name = 'module'
    pk_url_kwarg = 'module_id'
    
    def get_queryset(self):
        return TrainingModule.objects.filter(
            equipment__is_active=True,
            is_active=True
        )
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        module = self.object
        user = self.request.user
        
        # Progresso do usuário neste módulo
        progress, created = TrainingProgress.objects.get_or_create(
            client=user,
            module=module
        )
        
        # NOVA LÓGICA: Verificar se pode acessar este módulo
        can_access_module = self._can_access_module(user, module)
        
        # Se pode acessar e é o primeiro acesso, marca como iniciado
        if can_access_module and (created or progress.status == 'not_started'):
            progress.start_module()
        
        # Navegação entre módulos
        equipment_modules = TrainingModule.objects.filter(
            equipment=module.equipment,
            is_active=True
        ).order_by('order')
        
        # Encontrar posição do módulo atual
        current_index = None
        modules_list = list(equipment_modules)
        
        for i, mod in enumerate(modules_list):
            if mod.id == module.id:
                current_index = i
                break
        
        # Determinar módulo anterior e próximo
        prev_module = None
        next_module = None
        can_go_next = False
        
        if current_index is not None:
            # Módulo anterior (sempre disponível se existir)
            if current_index > 0:
                prev_module = modules_list[current_index - 1]
            
            # Próximo módulo (só se o atual estiver concluído)
            if current_index < len(modules_list) - 1:
                next_module = modules_list[current_index + 1]
                can_go_next = progress.is_completed
        
        # NOVO: Mensagem de bloqueio se não pode acessar
        access_message = None
        if not can_access_module:
            prev_module_title = None
            if module.order > 1:
                prev_mod = TrainingModule.objects.filter(
                    equipment=module.equipment,
                    order=module.order - 1,
                    is_active=True
                ).first()
                if prev_mod:
                    prev_module_title = prev_mod.title
            
            access_message = f"Complete o módulo anterior ({prev_module_title}) antes de acessar este conteúdo."
        
        context.update({
            'progress': progress,
            'equipment': module.equipment,
            'prev_module': prev_module,
            'next_module': next_module,
            'can_go_next': can_go_next,
            'can_access_module': can_access_module,  # NOVO
            'access_message': access_message,        # NOVO
            'current_module_number': (current_index + 1) if current_index is not None else 1,
            'total_modules': len(modules_list),
        })
        
        return context
    
    def _can_access_module(self, user, module):
        """Verifica se o usuário pode acessar este módulo"""
        # Primeiro módulo sempre pode acessar
        if module.order == 1:
            return True
        
        # Para outros módulos, verificar se o anterior foi concluído
        prev_module = TrainingModule.objects.filter(
            equipment=module.equipment,
            order=module.order - 1,
            is_active=True
        ).first()
        
        if prev_module:
            prev_progress = TrainingProgress.objects.filter(
                client=user,
                module=prev_module
            ).first()
            
            return prev_progress and prev_progress.is_completed
        
        return False

@method_decorator(csrf_exempt, name='dispatch')
class UpdateProgressView(LoginRequiredMixin, TemplateView):
    """API para atualizar progresso do vídeo"""
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            module_id = kwargs.get('module_id')
            current_time = data.get('current_time', 0)
            
            module = get_object_or_404(TrainingModule, id=module_id)
            
            # Atualizar progresso (código existente)
            progress, created = TrainingProgress.objects.get_or_create(
                client=request.user,
                module=module
            )
            
            # Salvar progresso atual
            old_status = progress.status
            progress.update_progress(current_time)
            
            # NOVA FUNCIONALIDADE: Verificar se módulo foi concluído AGORA
            if old_status != 'completed' and progress.status == 'completed':
                print(f"🎉 Módulo concluído: {module.title}")
                
                # VERIFICAR SE DEVE GERAR CERTIFICADO
                certificate_generated, certificate = update_progress_and_check_completion(
                    request.user, 
                    module
                )
                
                if certificate_generated:
                    print(f"🎓 Certificado gerado automaticamente: {certificate.certificate_code}")
            
            return JsonResponse({
                'success': True,
                'completion_percentage': progress.completion_percentage,
                'is_completed': progress.is_completed,
                'status': progress.status,
            })
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


# ===== VIEWS ADMINISTRATIVAS =====

class AdminTrainingListView(LoginRequiredMixin, AdminRequiredMixin, ListView):
    """Lista de equipamentos para gerenciar treinamentos"""
    model = Equipment
    template_name = 'admin/training/list.html'
    context_object_name = 'equipments'
    
    def get_queryset(self):
        return Equipment.objects.filter(is_active=True).annotate(
            modules_count=Count('training_modules')
        ).order_by('category__order', 'order')


class ModuleListView(LoginRequiredMixin, AdminRequiredMixin, ListView):
    """Lista de módulos de um equipamento"""
    model = TrainingModule
    template_name = 'admin/training/modules.html'
    context_object_name = 'modules'
    
    def get_queryset(self):
        equipment_id = self.kwargs.get('equipment_id')
        return TrainingModule.objects.filter(
            equipment_id=equipment_id
        ).order_by('order')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        equipment_id = self.kwargs.get('equipment_id')
        context['equipment'] = get_object_or_404(Equipment, id=equipment_id)
        return context


class ModuleCreateView(LoginRequiredMixin, AdminRequiredMixin, CreateView):
    """Criação de módulo de treinamento"""
    model = TrainingModule
    template_name = 'admin/training/module_form.html'
    fields = ['title', 'description', 'video_file', 'duration_seconds', 'order', 'is_active']
    
    def form_valid(self, form):
        equipment_id = self.kwargs.get('equipment_id')
        equipment = get_object_or_404(Equipment, id=equipment_id)
        form.instance.equipment = equipment
        
        messages.success(
            self.request, 
            f'Módulo "{form.instance.title}" criado com sucesso!'
        )
        
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse_lazy('training:module_list', kwargs={
            'equipment_id': self.kwargs.get('equipment_id')
        })
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        equipment_id = self.kwargs.get('equipment_id')
        context['equipment'] = get_object_or_404(Equipment, id=equipment_id)
        context['title'] = 'Novo Módulo'
        return context


class ModuleEditView(LoginRequiredMixin, AdminRequiredMixin, UpdateView):
    """Edição de módulo de treinamento"""
    model = TrainingModule
    template_name = 'admin/training/module_form.html'
    fields = ['title', 'description', 'video_file', 'duration_seconds', 'order', 'is_active']
    
    def form_valid(self, form):
        messages.success(
            self.request, 
            f'Módulo "{form.instance.title}" atualizado com sucesso!'
        )
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse_lazy('training:module_list', kwargs={
            'equipment_id': self.object.equipment.id
        })
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['equipment'] = self.object.equipment
        context['title'] = f'Editar: {self.object.title}'
        return context


class ProgressReportView(LoginRequiredMixin, AdminRequiredMixin, TemplateView):
    """Relatório de progresso dos treinamentos"""
    template_name = 'admin/training/progress_report.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Estatísticas gerais
        context.update({
            'total_equipments': Equipment.objects.filter(is_active=True).count(),
            'total_modules': TrainingModule.objects.filter(is_active=True).count(),
            'total_users': TrainingProgress.objects.values('client').distinct().count(),
            'total_completions': TrainingProgress.objects.filter(status='completed').count(),
        })
        
        return context