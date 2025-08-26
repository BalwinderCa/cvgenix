from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
import uuid

from .models import Resume, ResumeSection, ResumeVersion, ResumeExport, ResumeShare
from .serializers import (
    ResumeSerializer, ResumeCreateSerializer, ResumeUpdateSerializer,
    ResumeSectionSerializer, ResumeVersionSerializer, ResumeExportSerializer,
    ResumeShareSerializer, ResumeContentUpdateSerializer, ResumeSectionUpdateSerializer,
    ResumeTemplateChangeSerializer, ResumeExportRequestSerializer,
    ResumeShareCreateSerializer, ResumeDuplicateSerializer, ResumeBulkActionSerializer,
    ResumeSearchSerializer, ResumeAnalyticsSerializer, ResumePreviewSerializer,
    ResumeValidationSerializer, ResumeComparisonSerializer
)
from users.models import UserActivity


class ResumeViewSet(ModelViewSet):
    """ViewSet for Resume CRUD operations"""
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'target_company']
    ordering_fields = ['created_at', 'updated_at', 'title', 'ats_score']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        """Return resumes for the current user"""
        return Resume.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return ResumeCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ResumeUpdateSerializer
        return ResumeSerializer
    
    def perform_create(self, serializer):
        """Create resume for current user"""
        # Get or create user profile
        from profiles.models import Profile
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        
        serializer.save(user=self.request.user, profile=profile)
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='resume_created',
            description=f'Resume "{serializer.instance.title}" created',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    def perform_update(self, serializer):
        """Update resume and track activity"""
        serializer.save()
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='resume_updated',
            description=f'Resume "{serializer.instance.title}" updated',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        """Create a new version of the resume"""
        resume = self.get_object()
        new_resume = resume.create_new_version()
        
        # Track activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='resume_versioned',
            description=f'Resume "{resume.title}" version {new_resume.version} created',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'message': f'Resume version {new_resume.version} created successfully',
            'new_resume_id': new_resume.id
        })
    
    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get all versions of the resume"""
        resume = self.get_object()
        versions = ResumeVersion.objects.filter(resume=resume)
        serializer = ResumeVersionSerializer(versions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_content(self, request, pk=None):
        """Update specific content section"""
        resume = self.get_object()
        serializer = ResumeContentUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            section_name = serializer.validated_data['section_name']
            content = serializer.validated_data['content']
            
            resume.update_content_section(section_name, content)
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='resume_content_updated',
                description=f'Resume "{resume.title}" {section_name} section updated',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': f'{section_name} section updated successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def change_template(self, request, pk=None):
        """Change resume template"""
        resume = self.get_object()
        serializer = ResumeTemplateChangeSerializer(data=request.data)
        
        if serializer.is_valid():
            template_id = serializer.validated_data['template_id']
            preserve_content = serializer.validated_data['preserve_content']
            
            from templates.models import Template
            template = Template.objects.get(id=template_id)
            
            # Change template
            resume.template = template
            resume.save()
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='resume_template_changed',
                description=f'Resume "{resume.title}" template changed to {template.name}',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': f'Template changed to {template.name}'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def export(self, request, pk=None):
        """Export resume to different formats"""
        resume = self.get_object()
        serializer = ResumeExportRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            format_type = serializer.validated_data['format']
            settings = serializer.validated_data['settings']
            
            # Create export record
            export = ResumeExport.objects.create(
                resume=resume,
                format=format_type,
                export_settings=settings
            )
            
            # TODO: Trigger async export task
            # from .tasks import export_resume_task
            # export_resume_task.delay(export.id)
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='resume_exported',
                description=f'Resume "{resume.title}" exported as {format_type.upper()}',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({
                'message': f'Resume export started',
                'export_id': export.id
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Create shareable link for resume"""
        resume = self.get_object()
        serializer = ResumeShareCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            expires_in_days = serializer.validated_data['expires_in_days']
            is_active = serializer.validated_data['is_active']
            
            # Generate unique token
            share_token = str(uuid.uuid4())
            
            # Create share record
            share = ResumeShare.objects.create(
                resume=resume,
                share_token=share_token,
                is_active=is_active,
                expires_at=timezone.now() + timezone.timedelta(days=expires_in_days)
            )
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='resume_shared',
                description=f'Resume "{resume.title}" shared',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({
                'message': 'Shareable link created',
                'share_url': share.get_share_url(),
                'share_id': share.id
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate resume"""
        resume = self.get_object()
        serializer = ResumeDuplicateSerializer(data=request.data)
        
        if serializer.is_valid():
            new_title = serializer.validated_data['new_title']
            include_content = serializer.validated_data['include_content']
            include_sections = serializer.validated_data['include_sections']
            
            # Create duplicate
            new_resume = Resume.objects.create(
                user=request.user,
                profile=resume.profile,
                title=new_title,
                description=resume.description,
                template=resume.template,
                content=resume.content if include_content else {},
                sections=resume.sections if include_sections else {},
                target_company=resume.target_company,
                job_description=resume.job_description,
                export_format=resume.export_format
            )
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='resume_duplicated',
                description=f'Resume "{resume.title}" duplicated as "{new_title}"',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({
                'message': f'Resume duplicated as "{new_title}"',
                'new_resume_id': new_resume.id
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Get resume preview data"""
        resume = self.get_object()
        
        # TODO: Generate preview HTML and CSS
        preview_data = {
            'html_content': '<div>Resume preview HTML</div>',
            'css_styles': 'body { font-family: Arial; }',
            'metadata': {
                'title': resume.title,
                'template': resume.template.name if resume.template else None
            },
            'preview_url': f'/resume/{resume.id}/preview'
        }
        
        serializer = ResumePreviewSerializer(preview_data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def validate(self, request, pk=None):
        """Validate resume content"""
        resume = self.get_object()
        
        # TODO: Implement validation logic
        validation_data = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'suggestions': [],
            'completion_percentage': 85.0
        }
        
        serializer = ResumeValidationSerializer(validation_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Perform bulk actions on resumes"""
        serializer = ResumeBulkActionSerializer(data=request.data)
        
        if serializer.is_valid():
            action = serializer.validated_data['action']
            resume_ids = serializer.validated_data['resume_ids']
            options = serializer.validated_data['options']
            
            resumes = Resume.objects.filter(id__in=resume_ids, user=request.user)
            
            with transaction.atomic():
                if action == 'delete':
                    resumes.delete()
                    message = f'{len(resume_ids)} resumes deleted'
                elif action == 'archive':
                    resumes.update(status='archived')
                    message = f'{len(resume_ids)} resumes archived'
                elif action == 'export':
                    # TODO: Implement bulk export
                    message = f'Bulk export started for {len(resume_ids)} resumes'
                elif action == 'share':
                    # TODO: Implement bulk share
                    message = f'Bulk share started for {len(resume_ids)} resumes'
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type=f'resume_bulk_{action}',
                description=message,
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': message})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get resume analytics"""
        user_resumes = Resume.objects.filter(user=request.user)
        
        analytics_data = {
            'total_resumes': user_resumes.count(),
            'total_views': 0,  # TODO: Implement view tracking
            'total_exports': ResumeExport.objects.filter(resume__user=request.user).count(),
            'total_shares': ResumeShare.objects.filter(resume__user=request.user).count(),
            'average_ats_score': user_resumes.aggregate(avg_score=models.Avg('ats_score'))['avg_score'] or 0,
            'most_used_template': 'Default Template',  # TODO: Calculate
            'recent_activity': []  # TODO: Get recent activity
        }
        
        serializer = ResumeAnalyticsSerializer(analytics_data)
        return Response(serializer.data)


class ResumeSectionViewSet(ModelViewSet):
    """ViewSet for Resume Section CRUD operations"""
    serializer_class = ResumeSectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return sections for the specified resume"""
        resume_id = self.kwargs.get('resume_pk')
        return ResumeSection.objects.filter(resume_id=resume_id, resume__user=self.request.user)
    
    def perform_create(self, serializer):
        """Create section for the specified resume"""
        resume_id = self.kwargs.get('resume_pk')
        resume = get_object_or_404(Resume, id=resume_id, user=self.request.user)
        serializer.save(resume=resume)
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='resume_section_added',
            description=f'Section added to resume "{resume.title}"',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def compare_resumes(request):
    """Compare two resumes"""
    serializer = ResumeComparisonSerializer(data=request.data)
    
    if serializer.is_valid():
        resume1_id = serializer.validated_data['resume1_id']
        resume2_id = serializer.validated_data['resume2_id']
        
        resume1 = get_object_or_404(Resume, id=resume1_id, user=request.user)
        resume2 = get_object_or_404(Resume, id=resume2_id, user=request.user)
        
        # TODO: Implement comparison logic
        comparison_data = {
            'resume1_id': resume1_id,
            'resume2_id': resume2_id,
            'differences': [],
            'similarities': [],
            'recommendations': []
        }
        
        return Response(comparison_data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def shared_resume_view(request, share_token):
    """View shared resume (public endpoint)"""
    share = get_object_or_404(ResumeShare, share_token=share_token, is_active=True)
    
    # Check if expired
    if share.expires_at and share.expires_at < timezone.now():
        return Response({'error': 'Share link has expired'}, status=status.HTTP_410_GONE)
    
    # Increment view count
    share.increment_view_count()
    
    # Get resume data
    resume = share.resume
    serializer = ResumeSerializer(resume)
    
    return Response(serializer.data)
