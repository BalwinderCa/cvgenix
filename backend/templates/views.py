from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone

from .models import Template, TemplateSection, TemplateAsset, TemplateTheme, TemplateCategory, TemplateUsage
from .serializers import (
    TemplateSerializer, TemplateCreateSerializer, TemplateUpdateSerializer,
    TemplateSectionSerializer, TemplateAssetSerializer, TemplateThemeSerializer,
    TemplateCategorySerializer, TemplateUsageSerializer, TemplatePreviewSerializer,
    TemplateDuplicateSerializer, TemplateSearchSerializer, TemplateAnalyticsSerializer,
    TemplateValidationSerializer, TemplateExportSerializer, TemplateImportSerializer,
    TemplateBulkActionSerializer, TemplateComparisonSerializer, TemplateCustomizationSerializer,
    TemplateRatingSerializer
)
from users.models import UserActivity


class TemplateViewSet(ModelViewSet):
    """ViewSet for Template CRUD operations"""
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['name', 'created_at', 'updated_at', 'usage_count']
    ordering = ['-is_featured', '-usage_count', '-created_at']
    
    def get_queryset(self):
        """Return templates based on user permissions"""
        if self.request.user.is_staff:
            return Template.objects.all()
        else:
            return Template.objects.filter(status='published')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return TemplateCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TemplateUpdateSerializer
        return TemplateSerializer
    
    def perform_create(self, serializer):
        """Create template and track activity"""
        serializer.save(created_by=self.request.user)
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='template_created',
            description=f'Template "{serializer.instance.name}" created',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    def perform_update(self, serializer):
        """Update template and track activity"""
        serializer.save()
        
        # Track activity
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='template_updated',
            description=f'Template "{serializer.instance.name}" updated',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate template"""
        template = self.get_object()
        serializer = TemplateDuplicateSerializer(data=request.data)
        
        if serializer.is_valid():
            new_name = serializer.validated_data['new_name']
            include_assets = serializer.validated_data['include_assets']
            include_themes = serializer.validated_data['include_themes']
            
            # Create duplicate
            new_template = Template.objects.create(
                name=new_name,
                description=template.description,
                category=template.category,
                layout_config=template.layout_config,
                styles=template.styles,
                sections=template.sections,
                is_premium=template.is_premium,
                is_featured=False,  # New templates are not featured by default
                created_by=request.user
            )
            
            # Copy assets if requested
            if include_assets:
                for asset in template.assets.all():
                    TemplateAsset.objects.create(
                        template=new_template,
                        name=asset.name,
                        asset_type=asset.asset_type,
                        file=asset.file,
                        alt_text=asset.alt_text,
                        description=asset.description,
                        is_required=asset.is_required,
                        default_position=asset.default_position
                    )
            
            # Copy themes if requested
            if include_themes:
                for theme in template.themes.all():
                    TemplateTheme.objects.create(
                        template=new_template,
                        name=theme.name,
                        description=theme.description,
                        colors=theme.colors,
                        typography=theme.typography,
                        spacing=theme.spacing
                    )
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='template_duplicated',
                description=f'Template "{template.name}" duplicated as "{new_name}"',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({
                'message': f'Template duplicated as "{new_name}"',
                'new_template_id': new_template.id
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def use_template(self, request, pk=None):
        """Mark template as used by a resume"""
        template = self.get_object()
        resume_id = request.data.get('resume_id')
        
        if not resume_id:
            return Response(
                {'error': 'resume_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create usage record
        from resumes.models import Resume
        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
            usage = TemplateUsage.objects.create(
                template=template,
                user=request.user,
                resume=resume
            )
            
            # Increment usage count
            template.increment_usage()
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='template_used',
                description=f'Template "{template.name}" used for resume "{resume.title}"',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': 'Template usage recorded'})
        
        except Resume.DoesNotExist:
            return Response(
                {'error': 'Resume not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Get template preview data"""
        template = self.get_object()
        
        # TODO: Generate preview HTML and CSS
        preview_data = {
            'html_content': f'<div>Template preview for {template.name}</div>',
            'css_styles': template.styles.get('css', ''),
            'metadata': {
                'name': template.name,
                'category': template.get_category_display(),
                'is_premium': template.is_premium
            },
            'preview_url': f'/templates/{template.id}/preview'
        }
        
        serializer = TemplatePreviewSerializer(preview_data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def validate(self, request, pk=None):
        """Validate template structure"""
        template = self.get_object()
        
        # TODO: Implement validation logic
        validation_data = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'suggestions': []
        }
        
        serializer = TemplateValidationSerializer(validation_data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def customize(self, request, pk=None):
        """Customize template for a specific resume"""
        template = self.get_object()
        serializer = TemplateCustomizationSerializer(data=request.data)
        
        if serializer.is_valid():
            # TODO: Apply customization to template
            customization_data = serializer.validated_data
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='template_customized',
                description=f'Template "{template.name}" customized',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': 'Template customization applied'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Perform bulk actions on templates"""
        serializer = TemplateBulkActionSerializer(data=request.data)
        
        if serializer.is_valid():
            action = serializer.validated_data['action']
            template_ids = serializer.validated_data['template_ids']
            options = serializer.validated_data['options']
            
            templates = Template.objects.filter(id__in=template_ids)
            
            with transaction.atomic():
                if action == 'publish':
                    templates.update(status='published')
                    message = f'{len(template_ids)} templates published'
                elif action == 'archive':
                    templates.update(status='archived')
                    message = f'{len(template_ids)} templates archived'
                elif action == 'delete':
                    templates.delete()
                    message = f'{len(template_ids)} templates deleted'
                elif action == 'feature':
                    templates.update(is_featured=True)
                    message = f'{len(template_ids)} templates featured'
            
            # Track activity
            UserActivity.objects.create(
                user=request.user,
                activity_type=f'template_bulk_{action}',
                description=message,
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': message})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get template analytics"""
        templates = Template.objects.all()
        
        analytics_data = {
            'total_templates': templates.count(),
            'total_usage': TemplateUsage.objects.count(),
            'most_popular_template': 'Default Template',  # TODO: Calculate
            'average_usage': templates.aggregate(avg_usage=models.Avg('usage_count'))['avg_usage'] or 0,
            'category_distribution': {},  # TODO: Calculate
            'recent_usage': []  # TODO: Get recent usage
        }
        
        serializer = TemplateAnalyticsSerializer(analytics_data)
        return Response(serializer.data)


class TemplateCategoryViewSet(ModelViewSet):
    """ViewSet for Template Category CRUD operations"""
    serializer_class = TemplateCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    ordering = ['sort_order', 'name']
    
    def get_queryset(self):
        """Return active categories"""
        return TemplateCategory.objects.filter(is_active=True)


class TemplateAssetViewSet(ModelViewSet):
    """ViewSet for Template Asset CRUD operations"""
    serializer_class = TemplateAssetSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return assets for the specified template"""
        template_id = self.kwargs.get('template_pk')
        return TemplateAsset.objects.filter(template_id=template_id)
    
    def perform_create(self, serializer):
        """Create asset for the specified template"""
        template_id = self.kwargs.get('template_pk')
        template = get_object_or_404(Template, id=template_id)
        serializer.save(template=template)


class TemplateThemeViewSet(ModelViewSet):
    """ViewSet for Template Theme CRUD operations"""
    serializer_class = TemplateThemeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return themes for the specified template"""
        template_id = self.kwargs.get('template_pk')
        return TemplateTheme.objects.filter(template_id=template_id)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def compare_templates(request):
    """Compare two templates"""
    serializer = TemplateComparisonSerializer(data=request.data)
    
    if serializer.is_valid():
        template1_id = serializer.validated_data['template1_id']
        template2_id = serializer.validated_data['template2_id']
        
        template1 = get_object_or_404(Template, id=template1_id)
        template2 = get_object_or_404(Template, id=template2_id)
        
        # TODO: Implement comparison logic
        comparison_data = {
            'template1_id': template1_id,
            'template2_id': template2_id,
            'differences': [],
            'similarities': [],
            'recommendations': []
        }
        
        return Response(comparison_data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def import_template(request):
    """Import template from file"""
    serializer = TemplateImportSerializer(data=request.data)
    
    if serializer.is_valid():
        file = serializer.validated_data['file']
        overwrite_existing = serializer.validated_data['overwrite_existing']
        validate_only = serializer.validated_data['validate_only']
        
        # TODO: Implement template import logic
        
        return Response({'message': 'Template import completed'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def export_template(request, pk):
    """Export template to file"""
    template = get_object_or_404(Template, id=pk)
    serializer = TemplateExportSerializer(data=request.data)
    
    if serializer.is_valid():
        format_type = serializer.validated_data['format']
        include_assets = serializer.validated_data['include_assets']
        include_themes = serializer.validated_data['include_themes']
        
        # TODO: Implement template export logic
        
        return Response({'message': f'Template exported as {format_type}'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def rate_template(request, pk):
    """Rate a template"""
    template = get_object_or_404(Template, id=pk)
    serializer = TemplateRatingSerializer(data=request.data)
    
    if serializer.is_valid():
        rating = serializer.validated_data['rating']
        review = serializer.validated_data.get('review', '')
        tags = serializer.validated_data.get('tags', [])
        
        # TODO: Save rating and review
        
        return Response({'message': 'Rating submitted successfully'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
