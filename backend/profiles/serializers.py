from rest_framework import serializers
from .models import Profile, Education, Experience, Skill, Project, Certification, ProfileVersion


class EducationSerializer(serializers.ModelSerializer):
    """Serializer for Education model"""
    
    class Meta:
        model = Education
        fields = [
            'id', 'institution', 'degree', 'field_of_study', 'start_date', 
            'end_date', 'gpa', 'description', 'order'
        ]
        read_only_fields = ['id']


class ExperienceSerializer(serializers.ModelSerializer):
    """Serializer for Experience model"""
    
    class Meta:
        model = Experience
        fields = [
            'id', 'company', 'position', 'location', 'start_date', 
            'end_date', 'current', 'description', 'order'
        ]
        read_only_fields = ['id']


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for Skill model"""
    
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'level', 'order']
        read_only_fields = ['id']


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model"""
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'url', 'start_date', 
            'end_date', 'technologies', 'order'
        ]
        read_only_fields = ['id']


class CertificationSerializer(serializers.ModelSerializer):
    """Serializer for Certification model"""
    
    class Meta:
        model = Certification
        fields = [
            'id', 'name', 'issuing_organization', 'issue_date', 
            'expiry_date', 'credential_id', 'credential_url', 'order'
        ]
        read_only_fields = ['id']


class ProfileSerializer(serializers.ModelSerializer):
    """Main Profile serializer with nested related data"""
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'about', 'headline', 'phone', 'location', 'website',
            'linkedin_url', 'github_url', 'twitter_url', 'portfolio_url',
            'version', 'is_active', 'created_at', 'updated_at',
            'education', 'experience', 'skills', 'projects', 'certifications'
        ]
        read_only_fields = ['id', 'user', 'version', 'created_at', 'updated_at']


class ProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new profile"""
    
    class Meta:
        model = Profile
        fields = [
            'about', 'headline', 'phone', 'location', 'website',
            'linkedin_url', 'github_url', 'twitter_url', 'portfolio_url'
        ]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating profile data"""
    
    class Meta:
        model = Profile
        fields = [
            'about', 'headline', 'phone', 'location', 'website',
            'linkedin_url', 'github_url', 'twitter_url', 'portfolio_url'
        ]


class ProfileVersionSerializer(serializers.ModelSerializer):
    """Serializer for Profile Version model"""
    
    class Meta:
        model = ProfileVersion
        fields = [
            'id', 'profile', 'version_number', 'created_at', 
            'created_by', 'notes'
        ]
        read_only_fields = ['id', 'profile', 'version_number', 'created_at', 'created_by']


class BulkEducationSerializer(serializers.Serializer):
    """Serializer for bulk education operations"""
    education = EducationSerializer(many=True)


class BulkExperienceSerializer(serializers.Serializer):
    """Serializer for bulk experience operations"""
    experience = ExperienceSerializer(many=True)


class BulkSkillSerializer(serializers.Serializer):
    """Serializer for bulk skill operations"""
    skills = SkillSerializer(many=True)


class BulkProjectSerializer(serializers.Serializer):
    """Serializer for bulk project operations"""
    projects = ProjectSerializer(many=True)


class BulkCertificationSerializer(serializers.Serializer):
    """Serializer for bulk certification operations"""
    certifications = CertificationSerializer(many=True)


class ProfileImportSerializer(serializers.Serializer):
    """Serializer for importing profile data from external sources"""
    source = serializers.ChoiceField(choices=['linkedin', 'github', 'manual'])
    data = serializers.JSONField()
    
    def validate_data(self, value):
        """Validate imported data structure"""
        required_fields = ['about', 'experience', 'education', 'skills']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Missing required field: {field}")
        return value


class ProfileExportSerializer(serializers.Serializer):
    """Serializer for exporting profile data"""
    format = serializers.ChoiceField(choices=['json', 'xml', 'csv'])
    include_metadata = serializers.BooleanField(default=True)


class ProfileSearchSerializer(serializers.Serializer):
    """Serializer for profile search functionality"""
    query = serializers.CharField(max_length=200)
    filters = serializers.JSONField(default=dict)
    sort_by = serializers.ChoiceField(
        choices=['created_at', 'updated_at', 'name'],
        default='updated_at'
    )
    sort_order = serializers.ChoiceField(
        choices=['asc', 'desc'],
        default='desc'
    )


class ProfileAnalyticsSerializer(serializers.Serializer):
    """Serializer for profile analytics data"""
    total_views = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    average_ats_score = serializers.FloatField()
    last_updated = serializers.DateTimeField()
    completion_percentage = serializers.FloatField()
    
    def to_representation(self, instance):
        """Calculate completion percentage"""
        data = super().to_representation(instance)
        
        # Calculate completion percentage based on filled fields
        profile = instance
        total_fields = 8  # about, headline, phone, location, website, etc.
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
        
        data['completion_percentage'] = (filled_fields / total_fields) * 100
        return data
