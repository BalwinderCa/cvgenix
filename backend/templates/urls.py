from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from . import views

app_name = 'templates'

# Create main router
router = DefaultRouter()
router.register(r'templates', views.TemplateViewSet, basename='template')
router.register(r'categories', views.TemplateCategoryViewSet, basename='template-category')

# Create nested router for template assets and themes
nested_router = routers.NestedDefaultRouter(router, r'templates', lookup='template')
nested_router.register(r'assets', views.TemplateAssetViewSet, basename='template-assets')
nested_router.register(r'themes', views.TemplateThemeViewSet, basename='template-themes')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    path('', include(nested_router.urls)),
    
    # Additional custom endpoints
    path('compare/', views.compare_templates, name='compare_templates'),
    path('import/', views.import_template, name='import_template'),
    path('templates/<int:pk>/export/', views.export_template, name='export_template'),
    path('templates/<int:pk>/rate/', views.rate_template, name='rate_template'),
]
