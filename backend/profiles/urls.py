from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'profiles'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'profiles', views.ProfileViewSet, basename='profile')
router.register(r'education', views.EducationViewSet, basename='education')
router.register(r'experience', views.ExperienceViewSet, basename='experience')
router.register(r'skills', views.SkillViewSet, basename='skill')
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'certifications', views.CertificationViewSet, basename='certification')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Additional custom endpoints
    path('reorder-sections/', views.reorder_sections, name='reorder_sections'),
    path('completion/', views.profile_completion, name='profile_completion'),
]
