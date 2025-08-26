from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone

from .models import Profile, Education, Experience, Skill, Project, Certification, ProfileVersion
from .serializers import (
    ProfileSerializer, ProfileCreateSerializer, ProfileUpdateSerializer,
    EducationSerializer, ExperienceSerializer, SkillSerializer,
    ProjectSerializer, CertificationSerializer, ProfileVersionSerializer,
    BulkEducationSerializer, BulkExperienceSerializer, BulkSkillSerializer,
    BulkProjectSerializer, BulkCertificationSerializer,
    ProfileImportSerializer, ProfileExportSerializer, ProfileSearchSerializer,
    ProfileAnalyticsSerializer
)
from users.models import UserActivity


class ProfileViewSet(ModelViewSet):
    """ViewSet for Profile CRUD operations"""
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['about', 'headline', 'location']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        """Return profiles for the current user"""
        return Profile.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return ProfileCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProfileUpdateSerializer
        return ProfileSerializer
    
    def perform_create(self, serializer):
        """Create profile for current user"""
        serializer.save(user=self.request.user)
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='profile_created',
            description='Profile created',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    def perform_update(self, serializer):
        """Update profile and track activity"""
        serializer.save()
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='profile_updated',
            description='Profile updated',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        """Create a new version of the profile"""
        profile = self.get_object()
        new_profile = profile.create_new_version()
        
        # Track activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='profile_versioned',
            description=f'Profile version {new_profile.version} created',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'message': f'Profile version {new_profile.version} created successfully',
            'new_profile_id': new_profile.id
        })
    
    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get all versions of the profile"""
        profile = self.get_object()
        versions = ProfileVersion.objects.filter(profile=profile)
        serializer = ProfileVersionSerializer(versions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def import_data(self, request, pk=None):
        """Import profile data from external sources"""
        profile = self.get_object()
        serializer = ProfileImportSerializer(data=request.data)
        
        if serializer.is_valid():
            source = serializer.validated_data['source']
            data = serializer.validated_data['data']
            
            # Import logic based on source
            if source == 'linkedin':
                # LinkedIn import logic
                pass
            elif source == 'github':
                # GitHub import logic
                pass
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='profile_imported',
                description=f'Profile data imported from {source}',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': f'Data imported from {source} successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get profile analytics"""
        profile = self.get_object()
        
        # Calculate analytics
        analytics_data = {
            'total_views': 0,  # TODO: Implement view tracking
            'total_downloads': 0,  # TODO: Implement download tracking
            'average_ats_score': 0,  # TODO: Calculate from ATS reports
            'last_updated': profile.updated_at,
            'completion_percentage': 0
        }
        
        serializer = ProfileAnalyticsSerializer(analytics_data)
        return Response(serializer.data)


class EducationViewSet(ModelViewSet):
    """ViewSet for Education CRUD operations"""
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return education for the current user's profile"""
        profile = get_object_or_404(Profile, user=self.request.user)
        return Education.objects.filter(profile=profile)
    
    def perform_create(self, serializer):
        """Create education entry for current user's profile"""
        profile = get_object_or_404(Profile, user=self.request.user)
        serializer.save(profile=profile)
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='education_added',
            description='Education entry added',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create education entries"""
        serializer = BulkEducationSerializer(data=request.data)
        
        if serializer.is_valid():
            profile = get_object_or_404(Profile, user=request.user)
            education_data = serializer.validated_data['education']
            
            with transaction.atomic():
                for edu_data in education_data:
                    Education.objects.create(profile=profile, **edu_data)
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='education_bulk_added',
                description=f'{len(education_data)} education entries added',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': f'{len(education_data)} education entries created'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExperienceViewSet(ModelViewSet):
    """ViewSet for Experience CRUD operations"""
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return experience for the current user's profile"""
        profile = get_object_or_404(Profile, user=self.request.user)
        return Experience.objects.filter(profile=profile)
    
    def perform_create(self, serializer):
        """Create experience entry for current user's profile"""
        profile = get_object_or_404(Profile, user=self.request.user)
        serializer.save(profile=profile)
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='experience_added',
            description='Experience entry added',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create experience entries"""
        serializer = BulkExperienceSerializer(data=request.data)
        
        if serializer.is_valid():
            profile = get_object_or_404(Profile, user=request.user)
            experience_data = serializer.validated_data['experience']
            
            with transaction.atomic():
                for exp_data in experience_data:
                    Experience.objects.create(profile=profile, **exp_data)
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='experience_bulk_added',
                description=f'{len(experience_data)} experience entries added',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': f'{len(experience_data)} experience entries created'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SkillViewSet(ModelViewSet):
    """ViewSet for Skill CRUD operations"""
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category']
    
    def get_queryset(self):
        """Return skills for the current user's profile"""
        profile = get_object_or_404(Profile, user=self.request.user)
        return Skill.objects.filter(profile=profile)
    
    def perform_create(self, serializer):
        """Create skill entry for current user's profile"""
        profile = get_object_or_404(Profile, user=self.request.user)
        serializer.save(profile=profile)
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='skill_added',
            description='Skill added',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create skill entries"""
        serializer = BulkSkillSerializer(data=request.data)
        
        if serializer.is_valid():
            profile = get_object_or_404(Profile, user=request.user)
            skills_data = serializer.validated_data['skills']
            
            with transaction.atomic():
                for skill_data in skills_data:
                    Skill.objects.create(profile=profile, **skill_data)
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='skills_bulk_added',
                description=f'{len(skills_data)} skills added',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': f'{len(skills_data)} skills created'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get available skill categories"""
        categories = Skill.SKILL_CATEGORIES
        return Response([{'value': cat[0], 'label': cat[1]} for cat in categories])


class ProjectViewSet(ModelViewSet):
    """ViewSet for Project CRUD operations"""
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return projects for the current user's profile"""
        profile = get_object_or_404(Profile, user=self.request.user)
        return Project.objects.filter(profile=profile)
    
    def perform_create(self, serializer):
        """Create project entry for current user's profile"""
        profile = get_object_or_404(Profile, user=self.request.user)
        serializer.save(profile=profile)
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='project_added',
            description='Project added',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create project entries"""
        serializer = BulkProjectSerializer(data=request.data)
        
        if serializer.is_valid():
            profile = get_object_or_404(Profile, user=request.user)
            projects_data = serializer.validated_data['projects']
            
            with transaction.atomic():
                for project_data in projects_data:
                    Project.objects.create(profile=profile, **project_data)
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='projects_bulk_added',
                description=f'{len(projects_data)} projects added',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': f'{len(projects_data)} projects created'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CertificationViewSet(ModelViewSet):
    """ViewSet for Certification CRUD operations"""
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return certifications for the current user's profile"""
        profile = get_object_or_404(Profile, user=self.request.user)
        return Certification.objects.filter(profile=profile)
    
    def perform_create(self, serializer):
        """Create certification entry for current user's profile"""
        profile = get_object_or_404(Profile, user=self.request.user)
        serializer.save(profile=profile)
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='certification_added',
            description='Certification added',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create certification entries"""
        serializer = BulkCertificationSerializer(data=request.data)
        
        if serializer.is_valid():
            profile = get_object_or_404(Profile, user=request.user)
            certifications_data = serializer.validated_data['certifications']
            
            with transaction.atomic():
                for cert_data in certifications_data:
                    Certification.objects.create(profile=profile, **cert_data)
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='certifications_bulk_added',
                description=f'{len(certifications_data)} certifications added',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': f'{len(certifications_data)} certifications created'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reorder_sections(request):
    """Reorder sections in a profile"""
    profile = get_object_or_404(Profile, user=request.user)
    section_type = request.data.get('section_type')
    new_order = request.data.get('order', [])
    
    if not section_type or not new_order:
        return Response(
            {'error': 'section_type and order are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update order for the specified section type
    with transaction.atomic():
        for index, item_id in enumerate(new_order):
            if section_type == 'education':
                Education.objects.filter(id=item_id, profile=profile).update(order=index)
            elif section_type == 'experience':
                Experience.objects.filter(id=item_id, profile=profile).update(order=index)
            elif section_type == 'skills':
                Skill.objects.filter(id=item_id, profile=profile).update(order=index)
            elif section_type == 'projects':
                Project.objects.filter(id=item_id, profile=profile).update(order=index)
            elif section_type == 'certifications':
                Certification.objects.filter(id=item_id, profile=profile).update(order=index)
    
    # Track activity
    UserActivity.objects.create(
        user=request.user,
        activity_type='sections_reordered',
        description=f'{section_type} sections reordered',
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return Response({'message': f'{section_type} sections reordered successfully'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile_completion(request):
    """Get profile completion percentage"""
    profile = get_object_or_404(Profile, user=request.user)
    
    # Calculate completion percentage
    total_fields = 8
    filled_fields = 0
    
    if profile.about:
        filled_fields += 1
    if profile.headline:
        filled_fields += 1
    if profile.phone:
        filled_fields += 1
    if profile.location:
        filled_fields += 1
    if profile.website:
        filled_fields += 1
    if profile.linkedin_url:
        filled_fields += 1
    if profile.github_url:
        filled_fields += 1
    if profile.portfolio_url:
        filled_fields += 1
    
    completion_percentage = (filled_fields / total_fields) * 100
    
    return Response({
        'completion_percentage': completion_percentage,
        'filled_fields': filled_fields,
        'total_fields': total_fields,
        'missing_fields': total_fields - filled_fields
    })
