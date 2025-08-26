from rest_framework import serializers
from .models import Template, TemplateSection, TemplateAsset, TemplateTheme, TemplateCategory, TemplateUsage


class TemplateSectionSerializer(serializers.ModelSerializer):
    """Serializer for Template Section model"""
    
    class Meta:
        model = TemplateSection
        fields = [
            'id', 'section_type', 'title', 'is_visible', 'is_required', 
            'order', 'layout_config', 'styles', 'content_config'
        ]
        read_only_fields = ['id']


class TemplateAssetSerializer(serializers.ModelSerializer):
    """Serializer for Template Asset model"""
    
    class Meta:
        model = TemplateAsset
        fields = [
            'id', 'name', 'asset_type', 'file', 'alt_text', 'description',
            'is_required', 'default_position'
        ]
        read_only_fields = ['id']


class TemplateThemeSerializer(serializers.ModelSerializer):
    """Serializer for Template Theme model"""
    
    class Meta:
        model = TemplateTheme
        fields = [
            'id', 'name', 'description', 'colors', 'typography', 'spacing',
            'preview_image'
        ]
        read_only_fields = ['id']


class TemplateCategorySerializer(serializers.ModelSerializer):
    """Serializer for Template Category model"""
    
    class Meta:
        model = TemplateCategory
        fields = [
            'id', 'name', 'description', 'icon', 'color', 'is_active', 'sort_order'
        ]
        read_only_fields = ['id']


class TemplateSerializer(serializers.ModelSerializer):
    """Main Template serializer with nested related data"""
    sections = TemplateSectionSerializer(many=True, read_only=True)
    assets = TemplateAssetSerializer(many=True, read_only=True)
    themes = TemplateThemeSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='get_category_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = Template
        fields = [
            'id', 'name', 'description', 'category', 'category_name', 'status',
            'thumbnail', 'preview_image', 'layout_config', 'styles', 'sections',
            'is_premium', 'is_featured', 'usage_count', 'version', 'created_at',
            'updated_at', 'created_by', 'created_by_name', 'assets', 'themes'
        ]
        read_only_fields = ['id', 'usage_count', 'version', 'created_at', 'updated_at', 'created_by']


class TemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new template"""
    
    class Meta:
        model = Template
        fields = [
            'name', 'description', 'category', 'layout_config', 'styles',
            'is_premium', 'is_featured'
        ]


class TemplateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating template data"""
    
    class Meta:
        model = Template
        fields = [
            'name', 'description', 'category', 'status', 'layout_config',
            'styles', 'is_premium', 'is_featured'
        ]


class TemplateUsageSerializer(serializers.ModelSerializer):
    """Serializer for Template Usage model"""
    
    class Meta:
        model = TemplateUsage
        fields = [
            'id', 'template', 'user', 'resume', 'used_at'
        ]
        read_only_fields = ['id', 'used_at']


class TemplatePreviewSerializer(serializers.Serializer):
    """Serializer for template preview data"""
    html_content = serializers.CharField()
    css_styles = serializers.CharField()
    metadata = serializers.JSONField()
    preview_url = serializers.URLField()


class TemplateDuplicateSerializer(serializers.Serializer):
    """Serializer for duplicating templates"""
    new_name = serializers.CharField(max_length=200)
    include_assets = serializers.BooleanField(default=True)
    include_themes = serializers.BooleanField(default=True)


class TemplateSearchSerializer(serializers.Serializer):
    """Serializer for template search functionality"""
    query = serializers.CharField(max_length=200, required=False)
    category = serializers.CharField(required=False)
    is_premium = serializers.BooleanField(required=False)
    is_featured = serializers.BooleanField(required=False)
    status = serializers.ChoiceField(
        choices=['draft', 'published', 'archived'],
        required=False
    )
    sort_by = serializers.ChoiceField(
        choices=['name', 'created_at', 'updated_at', 'usage_count'],
        default='name'
    )
    sort_order = serializers.ChoiceField(
        choices=['asc', 'desc'],
        default='asc'
    )


class TemplateAnalyticsSerializer(serializers.Serializer):
    """Serializer for template analytics data"""
    total_templates = serializers.IntegerField()
    total_usage = serializers.IntegerField()
    most_popular_template = serializers.CharField()
    average_usage = serializers.FloatField()
    category_distribution = serializers.JSONField()
    recent_usage = serializers.ListField()


class TemplateValidationSerializer(serializers.Serializer):
    """Serializer for template validation results"""
    is_valid = serializers.BooleanField()
    errors = serializers.ListField()
    warnings = serializers.ListField()
    suggestions = serializers.ListField()


class TemplateExportSerializer(serializers.Serializer):
    """Serializer for template export data"""
    format = serializers.ChoiceField(choices=['json', 'xml', 'zip'])
    include_assets = serializers.BooleanField(default=True)
    include_themes = serializers.BooleanField(default=True)


class TemplateImportSerializer(serializers.Serializer):
    """Serializer for template import data"""
    file = serializers.FileField()
    overwrite_existing = serializers.BooleanField(default=False)
    validate_only = serializers.BooleanField(default=False)


class TemplateBulkActionSerializer(serializers.Serializer):
    """Serializer for bulk template actions"""
    action = serializers.ChoiceField(choices=['publish', 'archive', 'delete', 'feature'])
    template_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )
    options = serializers.JSONField(default=dict)


class TemplateComparisonSerializer(serializers.Serializer):
    """Serializer for template comparison data"""
    template1_id = serializers.IntegerField()
    template2_id = serializers.IntegerField()
    differences = serializers.JSONField()
    similarities = serializers.JSONField()
    recommendations = serializers.ListField()


class TemplateCustomizationSerializer(serializers.Serializer):
    """Serializer for template customization"""
    colors = serializers.JSONField()
    typography = serializers.JSONField()
    spacing = serializers.JSONField()
    layout_modifications = serializers.JSONField(default=dict)


class TemplateRatingSerializer(serializers.Serializer):
    """Serializer for template ratings"""
    rating = serializers.IntegerField(min_value=1, max_value=5)
    review = serializers.CharField(max_length=1000, required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
