"""
URLs para o sistema de contas/autenticação - VERSÃO ATUALIZADA
Implementação das rotas para gestão de clientes
"""

# GSLEARNING - accounts/urls.py

from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # URLs básicas (já existentes)
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    
    # Reports
    path('reports/client-progress/', views.ClientProgressReportView.as_view(), name='client_progress_report'),
    path('reports/equipment-analytics/', views.EquipmentAnalyticsView.as_view(), name='equipment_analytics'),
    path('reports/certificates/', views.CertificateReportView.as_view(), name='certificate_report'),
    path('reports/time-metrics/', views.AdminTimeMetricsReportView.as_view(), name='time_metrics_report'),
    
    # URLs administrativas - DASHBOARD ADMIN (NOVO)
    path('admin-dashboard/', views.AdminDashboardView.as_view(), name='admin_dashboard'),

    path('first-password-change/', views.FirstPasswordChangeView.as_view(), name='first_password_change'),
    path('change-password/', views.PasswordChangeView.as_view(), name='change_password'),
    
    # URLs administrativas - GESTÃO DE CLIENTES
    path('manage/clients/', views.ClientListView.as_view(), name='client_list'),
    path('manage/clients/create/', views.ClientCreateView.as_view(), name='client_create'),
    path('manage/clients/<int:pk>/', views.ClientDetailView.as_view(), name='client_detail'),
    path('manage/clients/<int:pk>/edit/', views.ClientEditView.as_view(), name='client_edit'),
]