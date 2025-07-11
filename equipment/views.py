# GSLEARNING - equipment/views.py
# VERSÃO CORRIGIDA: Barra de progresso funcionando no client_list.html

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib import messages
from django.views.generic import ListView, CreateView, UpdateView, DetailView
from django.urls import reverse_lazy
from django.db.models import Q, Count
from django import forms

from .models import Equipment, EquipmentCategory, ClientEquipment


class AdminRequiredMixin(UserPassesTestMixin):
    """Mixin para verificar se o usuário é admin"""
    
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_admin


# ===== VIEWS DO CLIENTE =====

class EquipmentListView(LoginRequiredMixin, ListView):
    """
    Lista de equipamentos para cliente com cálculo correto de progresso
    CORREÇÃO: Agora calcula progresso corretamente para cada equipamento
    """
    model = Equipment
    template_name = 'equipment/client_list.html'
    context_object_name = 'equipments'
    
    def get_queryset(self):
        """Retorna apenas equipamentos do cliente logado"""
        user = self.request.user
        return Equipment.objects.filter(
            is_active=True,
            equipment_clients__client=user,
            equipment_clients__is_active=True
        ).order_by('category__order', 'order')
    
    def get_context_data(self, **kwargs):
        """
        Contexto simples - cálculos feitos via template tags
        """
        context = super().get_context_data(**kwargs)
        
        # Adicionar categorias para filtros
        context['categories'] = EquipmentCategory.objects.filter(is_active=True)
        
        return context


class EquipmentDetailView(LoginRequiredMixin, DetailView):
    """Detalhes de um equipamento para o cliente"""
    model = Equipment
    template_name = 'equipment/client_detail.html'
    context_object_name = 'equipment'
    
    def get_queryset(self):
        """Cliente só pode ver equipamentos que possui"""
        user = self.request.user
        return Equipment.objects.filter(
            is_active=True,
            equipment_clients__client=user,
            equipment_clients__is_active=True
        )
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        equipment = self.object
        user = self.request.user
        
        # Importar models necessários
        from training.models import TrainingModule, TrainingProgress
        
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
                completion_percentage = progress.completion_percentage
                is_completed = progress.status == 'completed'
                status = progress.status
            except TrainingProgress.DoesNotExist:
                completion_percentage = 0
                is_completed = False
                status = 'not_started'
            
            modules_with_progress.append({
                'module': module,
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