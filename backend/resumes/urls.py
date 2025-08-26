from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from . import views

app_name = 'resumes'

# Create main router
router = DefaultRouter()
router.register(r'resumes', views.ResumeViewSet, basename='resume')

# Create nested router for resume sections
nested_router = routers.NestedDefaultRouter(router, r'resumes', lookup='resume')
nested_router.register(r'sections', views.ResumeSectionViewSet, basename='resume-sections')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    path('', include(nested_router.urls)),
    
    # Additional custom endpoints
    path('compare/', views.compare_resumes, name='compare_resumes'),
    path('shared/<str:share_token>/', views.shared_resume_view, name='shared_resume_view'),
]
