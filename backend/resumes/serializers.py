from rest_framework import serializers
from .models import Resume, ResumeSection, ResumeVersion, ResumeExport, ResumeShare


class ResumeSectionSerializer(serializers.ModelSerializer):
    """Serializer for Resume Section model"""
    
    class Meta:
        model = ResumeSection
        fields = [
            'id', 'section_type', 'title', 'content', 'is_visible', 
            'order', 'custom_styles'
        ]
        read_only_fields = ['id']


class ResumeSerializer(serializers.ModelSerializer):
    """Main Resume serializer with nested related data"""
    sections = ResumeSectionSerializer(many=True, read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    ats_score_display = serializers.CharField(source='get_ats_score_display', read_only=True)
    
    class Meta:
        model = Resume
        fields = [
            'id', 'user', 'profile', 'title', 'description', 'template', 'template_name',
            'content', 'sections', 'status', 'version', 'target_company', 'job_description',
            'ats_score', 'ats_score_display', 'export_format', 'created_at', 'updated_at',
            'last_exported'
        ]
        read_only_fields = ['id', 'user', 'version', 'created_at', 'updated_at', 'last_exported']


class ResumeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new resume"""
    
    class Meta:
        model = Resume
        fields = [
            'title', 'description', 'template', 'target_company', 
            'job_description', 'export_format'
        ]


class ResumeUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating resume data"""
    
    class Meta:
        model = Resume
        fields = [
            'title', 'description', 'template', 'content', 'sections',
            'target_company', 'job_description', 'export_format'
        ]


class ResumeVersionSerializer(serializers.ModelSerializer):
    """Serializer for Resume Version model"""
    
    class Meta:
        model = ResumeVersion
        fields = [
            'id', 'resume', 'version_number', 'content', 'sections',
            'created_at', 'created_by', 'notes'
        ]
        read_only_fields = ['id', 'resume', 'version_number', 'created_at', 'created_by']


class ResumeExportSerializer(serializers.ModelSerializer):
    """Serializer for Resume Export model"""
    
    class Meta:
        model = ResumeExport
        fields = [
            'id', 'resume', 'format', 'file_path', 'file_size',
            'export_settings', 'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'resume', 'created_at']


class ResumeShareSerializer(serializers.ModelSerializer):
    """Serializer for Resume Share model"""
    share_url = serializers.CharField(source='get_share_url', read_only=True)
    
    class Meta:
        model = ResumeShare
        fields = [
            'id', 'resume', 'share_token', 'is_active', 'expires_at',
            'view_count', 'last_viewed', 'created_at', 'share_url'
        ]
        read_only_fields = ['id', 'resume', 'share_token', 'view_count', 'last_viewed', 'created_at']


class ResumeContentUpdateSerializer(serializers.Serializer):
    """Serializer for updating resume content"""
    section_name = serializers.CharField(max_length=50)
    content = serializers.JSONField()
    
    def validate_section_name(self, value):
        """Validate section name"""
        valid_sections = [
            'about', 'contact', 'education', 'experience', 'skills',
            'projects', 'certifications', 'languages', 'volunteer',
            'awards', 'publications', 'custom'
        ]
        if value not in valid_sections:
            raise serializers.ValidationError(f"Invalid section name: {value}")
        return value


class ResumeSectionUpdateSerializer(serializers.Serializer):
    """Serializer for updating resume sections"""
    sections = serializers.JSONField()
    
    def validate_sections(self, value):
        """Validate sections configuration"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Sections must be a dictionary")
        return value


class ResumeTemplateChangeSerializer(serializers.Serializer):
    """Serializer for changing resume template"""
    template_id = serializers.IntegerField()
    preserve_content = serializers.BooleanField(default=True)
    
    def validate_template_id(self, value):
        """Validate template exists"""
        from templates.models import Template
        try:
            Template.objects.get(id=value, status='published')
        except Template.DoesNotExist:
            raise serializers.ValidationError("Template not found or not published")
        return value


class ResumeExportRequestSerializer(serializers.Serializer):
    """Serializer for resume export requests"""
    format = serializers.ChoiceField(choices=['pdf', 'docx', 'html'])
    settings = serializers.JSONField(default=dict)
    include_metadata = serializers.BooleanField(default=True)
    
    def validate_settings(self, value):
        """Validate export settings"""
        valid_settings = ['page_size', 'margins', 'font_size', 'include_header']
        for key in value.keys():
            if key not in valid_settings:
                raise serializers.ValidationError(f"Invalid setting: {key}")
        return value


class ResumeShareCreateSerializer(serializers.Serializer):
    """Serializer for creating shareable resume links"""
    expires_in_days = serializers.IntegerField(min_value=1, max_value=365, default=30)
    is_active = serializers.BooleanField(default=True)


class ResumeDuplicateSerializer(serializers.Serializer):
    """Serializer for duplicating resumes"""
    new_title = serializers.CharField(max_length=200)
    include_content = serializers.BooleanField(default=True)
    include_sections = serializers.BooleanField(default=True)


class ResumeBulkActionSerializer(serializers.Serializer):
    """Serializer for bulk resume actions"""
    action = serializers.ChoiceField(choices=['delete', 'archive', 'export', 'share'])
    resume_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )
    options = serializers.JSONField(default=dict)


class ResumeSearchSerializer(serializers.Serializer):
    """Serializer for resume search functionality"""
    query = serializers.CharField(max_length=200, required=False)
    status = serializers.ChoiceField(
        choices=['draft', 'published', 'archived'],
        required=False
    )
    template = serializers.IntegerField(required=False)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    sort_by = serializers.ChoiceField(
        choices=['created_at', 'updated_at', 'title', 'ats_score'],
        default='updated_at'
    )
    sort_order = serializers.ChoiceField(
        choices=['asc', 'desc'],
        default='desc'
    )


class ResumeAnalyticsSerializer(serializers.Serializer):
    """Serializer for resume analytics data"""
    total_resumes = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_exports = serializers.IntegerField()
    total_shares = serializers.IntegerField()
    average_ats_score = serializers.FloatField()
    most_used_template = serializers.CharField()
    recent_activity = serializers.ListField()


class ResumePreviewSerializer(serializers.Serializer):
    """Serializer for resume preview data"""
    html_content = serializers.CharField()
    css_styles = serializers.CharField()
    metadata = serializers.JSONField()
    preview_url = serializers.URLField()


class ResumeValidationSerializer(serializers.Serializer):
    """Serializer for resume validation results"""
    is_valid = serializers.BooleanField()
    errors = serializers.ListField()
    warnings = serializers.ListField()
    suggestions = serializers.ListField()
    completion_percentage = serializers.FloatField()


class ResumeComparisonSerializer(serializers.Serializer):
    """Serializer for resume comparison data"""
    resume1_id = serializers.IntegerField()
    resume2_id = serializers.IntegerField()
    differences = serializers.JSONField()
    similarities = serializers.JSONField()
    recommendations = serializers.ListField()
