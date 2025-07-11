"""
Views para o sistema de equipamentos - VERSÃO ATUALIZADA
Implementação do filtro Cliente ↔ Equipamentos
"""

# GSLEARNING - equipment/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib import messages
from django.views.generic import ListView, CreateView, UpdateView, DetailView, TemplateView
from django.urls import reverse_lazy
from django.db.models import Q
from django.http import Http404

from .models import EquipmentCategory, Equipment, ClientEquipment


class AdminRequiredMixin(UserPassesTestMixin):
    """Mixin para verificar se o usuário é admin"""
    
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_admin


# ===== VIEWS DO CLIENTE - ATUALIZADAS COM FILTRO =====

class EquipmentListView(LoginRequiredMixin, ListView):
    """Lista de equipamentos para o cliente - FILTRADO POR CLIENTE"""
    model = Equipment
    template_name = 'equipment/client_list.html'
    context_object_name = 'equipments'
    
    def get_queryset(self):
        """NOVA LÓGICA: Filtrar apenas equipamentos do cliente logado"""
        user = self.request.user
        
        # Se for admin, mostrar todos (para teste)
        if user.is_admin:
            return Equipment.objects.filter(is_active=True).order_by('category__order', 'order')
        
        # Se for cliente, filtrar apenas equipamentos associados a ele
        return Equipment.objects.filter(
            is_active=True,
            equipment_clients__client=user,
            equipment_clients__is_active=True
        ).order_by('category__order', 'order')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        
        # Adicionar progresso para cada equipamento
        from training.models import TrainingModule, TrainingProgress
        equipments_with_progress = []
        
        for equipment in context['equipments']:
            total_modules = TrainingModule.objects.filter(
                equipment=equipment, 
                is_active=True
            ).count()
            
            completed_modules = TrainingProgress.objects.filter(
                client=user,
                module__equipment=equipment,
                status='completed'
            ).count()
            
            if total_modules > 0:
                progress_percentage = (completed_modules / total_modules) * 100
            else:
                progress_percentage = 0
            
            equipments_with_progress.append({
                'equipment': equipment,
                'total_modules': total_modules,
                'completed_modules': completed_modules,
                'progress_percentage': progress_percentage,
            })
        
        context['equipments_with_progress'] = equipments_with_progress
        
        # NOVO: Adicionar informações de debug
        context['user_type'] = user.user_type
        context['total_available_equipments'] = Equipment.objects.filter(is_active=True).count()
        context['client_equipments_count'] = ClientEquipment.objects.filter(
            client=user, 
            is_active=True
        ).count() if user.user_type == 'client' else 0
        
        return context


class EquipmentDetailView(LoginRequiredMixin, DetailView):
    """Detalhes do equipamento para o cliente - COM VERIFICAÇÃO DE ACESSO"""
    model = Equipment
    template_name = 'equipment/client_detail.html'
    context_object_name = 'equipment'
    
    def get_queryset(self):
        """NOVA LÓGICA: Verificar se cliente tem acesso ao equipamento"""
        user = self.request.user
        
        # Se for admin, pode ver todos
        if user.is_admin:
            return Equipment.objects.filter(is_active=True)
        
        # Se for cliente, apenas equipamentos associados
        return Equipment.objects.filter(
            is_active=True,
            equipment_clients__client=user,
            equipment_clients__is_active=True
        )
    
    def dispatch(self, request, *args, **kwargs):
        """Verificar acesso antes de processar"""
        try:
            return super().dispatch(request, *args, **kwargs)
        except Http404:
            # Se cliente tentar acessar equipamento que não possui
            if not request.user.is_admin:
                messages.error(request, 'Você não tem acesso a este equipamento.')
                return redirect('equipment:list')
            raise
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        equipment = self.object
        user = self.request.user
        
        # Módulos do equipamento
        from training.models import TrainingModule, TrainingProgress
        modules = TrainingModule.objects.filter(
            equipment=equipment,
            is_active=True
        ).order_by('order')
        
        # Progresso do usuário em cada módulo - LÓGICA MANTIDA
        modules_with_progress = []
        for module in modules:
            try:
                progress = TrainingProgress.objects.get(
                    client=user,
                    module=module
                )
            except TrainingProgress.DoesNotExist:
                progress = None
            
            # Verificar completion_percentage corretamente
            if progress:
                is_completed = progress.status == 'completed' and progress.completion_percentage >= 95
                completion_percentage = min(progress.completion_percentage, 100)
                status = progress.status
            else:
                is_completed = False
                completion_percentage = 0
                status = 'not_started'
            
            modules_with_progress.append({
                'module': module,
                'progress': progress,
                'is_completed': is_completed,
                'completion_percentage': completion_percentage,
                'status': status,
            })
        
        context['modules'] = modules
        context['total_modules'] = modules.count()
        context['modules_with_progress'] = modules_with_progress
        context['completed_modules'] = len([m for m in modules_with_progress if m['is_completed']])
        
        # Calcular progresso geral
        if context['total_modules'] > 0:
            context['overall_progress'] = (context['completed_modules'] / context['total_modules']) * 100
        else:
            context['overall_progress'] = 0
        
        # NOVO: Verificar se cliente tem acesso (para debug)
        if user.user_type == 'client':
            has_access = ClientEquipment.objects.filter(
                client=user,
                equipment=equipment,
                is_active=True
            ).exists()
            context['client_has_access'] = has_access
        
        return context


# ===== VIEWS ADMINISTRATIVAS - MANTIDAS IGUAIS =====

class AdminEquipmentListView(LoginRequiredMixin, AdminRequiredMixin, ListView):
    """Lista de equipamentos para admin"""
    model = Equipment
    template_name = 'admin/equipment/list.html'
    context_object_name = 'equipments'
    paginate_by = 20
    
    def get_queryset(self):
        queryset = Equipment.objects.select_related('category').order_by('category__order', 'order')
        
        # Filtro de busca
        search = self.request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(model__icontains=search) |
                Q(category__name__icontains=search)
            )
        
        # Filtro por categoria
        category_id = self.request.GET.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['search'] = self.request.GET.get('search', '')
        context['categories'] = EquipmentCategory.objects.filter(is_active=True)
        context['selected_category'] = self.request.GET.get('category', '')
        return context


class CategoryListView(LoginRequiredMixin, AdminRequiredMixin, ListView):
    """Lista de categorias para admin"""
    model = EquipmentCategory
    template_name = 'admin/equipment/categories.html'
    context_object_name = 'categories'
    
    def get_queryset(self):
        return EquipmentCategory.objects.order_by('order', 'name')


class CategoryCreateView(LoginRequiredMixin, AdminRequiredMixin, CreateView):
    """Criação de categoria"""
    model = EquipmentCategory
    template_name = 'admin/equipment/category_form.html'
    fields = ['name', 'description', 'icon', 'order', 'is_active']
    success_url = reverse_lazy('equipment:category_list')
    
    def form_valid(self, form):
        messages.success(self.request, f'Categoria "{form.instance.name}" criada com sucesso!')
        return super().form_valid(form)


class EquipmentCreateView(LoginRequiredMixin, AdminRequiredMixin, CreateView):
    """Criação de equipamento"""
    model = Equipment
    template_name = 'admin/equipment/form.html'
    fields = ['category', 'name', 'model', 'description', 'image', 'estimated_duration', 'order', 'is_active']
    success_url = reverse_lazy('equipment:admin_list')
    
    def form_valid(self, form):
        messages.success(self.request, f'Equipamento "{form.instance.name}" criado com sucesso!')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Novo Equipamento'
        return context


class EquipmentEditView(LoginRequiredMixin, AdminRequiredMixin, UpdateView):
    """Edição de equipamento"""
    model = Equipment
    template_name = 'admin/equipment/form.html'
    fields = ['category', 'name', 'model', 'description', 'image', 'estimated_duration', 'order', 'is_active']
    success_url = reverse_lazy('equipment:admin_list')
    
    def form_valid(self, form):
        messages.success(self.request, f'Equipamento "{form.instance.name}" atualizado com sucesso!')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = f'Editar: {self.object.name}'
        return context