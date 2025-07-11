"""
URLs para o sistema de treinamento - VERSÃO SIMPLIFICADA PARA TESTE
"""

# GSLEARNING - training/urls.py

from django.urls import path
from . import views

app_name = 'training'

urlpatterns = [
    # URLs do cliente - BÁSICAS PARA TESTE
    path('module/<int:module_id>/', views.ModuleView.as_view(), name='module'),
    path('api/progress/<int:module_id>/', views.UpdateProgressView.as_view(), name='update_progress'),
    
    # URLs administrativas - MANTEMOS AS ORIGINAIS
    path('admin/', views.AdminTrainingListView.as_view(), name='admin_list'),
    path('admin/equipment/<int:equipment_id>/modules/', views.ModuleListView.as_view(), name='module_list'),
    path('admin/equipment/<int:equipment_id>/modules/create/', views.ModuleCreateView.as_view(), name='module_create'),
    path('admin/modules/<int:pk>/edit/', views.ModuleEditView.as_view(), name='module_edit'),
    path('admin/progress/', views.ProgressReportView.as_view(), name='progress_report'),
]