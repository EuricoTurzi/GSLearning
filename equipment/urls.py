"""
URLs para o sistema de equipamentos
"""

# GSLEARNING - equipment/urls.py

from django.urls import path
from . import views

app_name = 'equipment'

urlpatterns = [
    # URLs do cliente
    path('', views.EquipmentListView.as_view(), name='list'),
    path('<int:pk>/', views.EquipmentDetailView.as_view(), name='detail'),
    
    # URLs administrativas
    path('admin/', views.AdminEquipmentListView.as_view(), name='admin_list'),
    path('admin/categories/', views.CategoryListView.as_view(), name='category_list'),
    path('admin/categories/create/', views.CategoryCreateView.as_view(), name='category_create'),
    path('admin/create/', views.EquipmentCreateView.as_view(), name='create'),
    path('admin/<int:pk>/edit/', views.EquipmentEditView.as_view(), name='edit'),
]