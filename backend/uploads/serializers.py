from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UploadedFile, DocumentProcessingJob, FileShare, FileAnalytics


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UploadedFileSerializer(serializers.ModelSerializer):
    """Serializer for UploadedFile model"""
    user = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    file_extension = serializers.SerializerMethodField()
    human_readable_size = serializers.SerializerMethodField()
    processing_jobs_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UploadedFile
        fields = [
            'id', 'user', 'file', 'file_url', 'original_filename', 'file_type',
            'file_size', 'human_readable_size', 'file_extension', 'mime_type',
            'status', 'processing_result', 'extracted_text', 'metadata',
            'is_public', 'processing_jobs_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'file_size', 'mime_type', 'status', 
                           'processing_result', 'extracted_text', 'metadata', 
                           'created_at', 'updated_at']
    
    def get_file_url(self, obj):
        """Get the URL for the uploaded file"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None
    
    def get_file_extension(self, obj):
        """Get file extension"""
        if obj.original_filename:
            return obj.original_filename.split('.')[-1].lower()
        return None
    
    def get_human_readable_size(self, obj):
        """Convert file size to human readable format"""
        if not obj.file_size:
            return "0 B"
        
        for unit in ['B', 'KB', 'MB', 'GB']:
            if obj.file_size < 1024.0:
                return f"{obj.file_size:.1f} {unit}"
            obj.file_size /= 1024.0
        return f"{obj.file_size:.1f} TB"
    
    def get_processing_jobs_count(self, obj):
        """Get count of processing jobs for this file"""
        return obj.processing_jobs.count()


class UploadedFileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating UploadedFile instances"""
    file = serializers.FileField(required=True)
    
    class Meta:
        model = UploadedFile
        fields = ['file', 'file_type', 'is_public']
    
    def validate_file(self, value):
        """Validate uploaded file"""
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError("File size must be less than 10MB")
        
        # Check file extension
        allowed_extensions = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png']
        file_extension = value.name.split('.')[-1].lower()
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type not supported. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        return value
    
    def create(self, validated_data):
        """Create UploadedFile instance"""
        validated_data['user'] = self.context['request'].user
        validated_data['original_filename'] = validated_data['file'].name
        validated_data['mime_type'] = validated_data['file'].content_type
        
        return super().create(validated_data)


class UploadedFileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating UploadedFile instances"""
    class Meta:
        model = UploadedFile
        fields = ['file_type', 'is_public', 'metadata']


class DocumentProcessingJobSerializer(serializers.ModelSerializer):
    """Serializer for DocumentProcessingJob model"""
    user = UserSerializer(read_only=True)
    uploaded_file = UploadedFileSerializer(read_only=True)
    uploaded_file_id = serializers.UUIDField(write_only=True)
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = DocumentProcessingJob
        fields = [
            'id', 'user', 'uploaded_file', 'uploaded_file_id', 'job_type',
            'job_type_display', 'status', 'status_display', 'priority',
            'progress', 'result', 'error_message', 'started_at', 'completed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'uploaded_file', 'status', 'progress',
                           'result', 'error_message', 'started_at', 'completed_at',
                           'created_at', 'updated_at']
    
    def validate_uploaded_file_id(self, value):
        """Validate that the uploaded file exists and belongs to the user"""
        user = self.context['request'].user
        try:
            uploaded_file = UploadedFile.objects.get(id=value, user=user)
            return value
        except UploadedFile.DoesNotExist:
            raise serializers.ValidationError("Uploaded file not found or access denied")
    
    def create(self, validated_data):
        """Create DocumentProcessingJob instance"""
        validated_data['user'] = self.context['request'].user
        uploaded_file_id = validated_data.pop('uploaded_file_id')
        validated_data['uploaded_file'] = UploadedFile.objects.get(id=uploaded_file_id)
        return super().create(validated_data)


class DocumentProcessingJobUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating DocumentProcessingJob instances"""
    class Meta:
        model = DocumentProcessingJob
        fields = ['priority', 'status']


class FileShareSerializer(serializers.ModelSerializer):
    """Serializer for FileShare model"""
    shared_by = UserSerializer(read_only=True)
    shared_with = UserSerializer(read_only=True)
    file = UploadedFileSerializer(read_only=True)
    file_id = serializers.UUIDField(write_only=True)
    permission_display = serializers.CharField(source='get_permission_display', read_only=True)
    share_url = serializers.SerializerMethodField()
    
    class Meta:
        model = FileShare
        fields = [
            'id', 'file', 'file_id', 'shared_by', 'shared_with', 'email',
            'permission', 'permission_display', 'expires_at', 'is_active',
            'access_count', 'last_accessed', 'share_url', 'created_at'
        ]
        read_only_fields = ['id', 'shared_by', 'file', 'access_count', 
                           'last_accessed', 'created_at']
    
    def get_share_url(self, obj):
        """Generate share URL"""
        request = self.context.get('request')
        if request:
            return f"{request.build_absolute_uri('/')}shared-file/{obj.id}/"
        return None
    
    def validate(self, data):
        """Validate share data"""
        # Either shared_with or email must be provided
        if not data.get('shared_with') and not data.get('email'):
            raise serializers.ValidationError(
                "Either 'shared_with' user or 'email' must be provided"
            )
        
        # Check if file exists and belongs to user
        user = self.context['request'].user
        file_id = data.get('file_id')
        try:
            file = UploadedFile.objects.get(id=file_id, user=user)
        except UploadedFile.DoesNotExist:
            raise serializers.ValidationError("File not found or access denied")
        
        return data
    
    def create(self, validated_data):
        """Create FileShare instance"""
        validated_data['shared_by'] = self.context['request'].user
        file_id = validated_data.pop('file_id')
        validated_data['file'] = UploadedFile.objects.get(id=file_id)
        return super().create(validated_data)


class FileShareUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating FileShare instances"""
    class Meta:
        model = FileShare
        fields = ['permission', 'expires_at', 'is_active']


class FileAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for FileAnalytics model"""
    file = UploadedFileSerializer(read_only=True)
    
    class Meta:
        model = FileAnalytics
        fields = [
            'id', 'file', 'view_count', 'download_count', 'share_count',
            'processing_time', 'file_size_optimized', 'compression_ratio',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'file', 'created_at', 'updated_at']


class FileAnalyticsUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating FileAnalytics instances"""
    class Meta:
        model = FileAnalytics
        fields = ['view_count', 'download_count', 'share_count']


# Bulk operation serializers
class BulkFileUploadSerializer(serializers.Serializer):
    """Serializer for bulk file uploads"""
    files = serializers.ListField(
        child=serializers.FileField(),
        max_length=10  # Max 10 files at once
    )
    file_type = serializers.ChoiceField(
        choices=UploadedFile.FILE_TYPES,
        default='other'
    )
    is_public = serializers.BooleanField(default=False)
    
    def validate_files(self, value):
        """Validate uploaded files"""
        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 files can be uploaded at once")
        
        for file in value:
            # Check file size (max 10MB per file)
            max_size = 10 * 1024 * 1024
            if file.size > max_size:
                raise serializers.ValidationError(f"File {file.name} is too large. Maximum size is 10MB")
            
            # Check file extension
            allowed_extensions = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png']
            file_extension = file.name.split('.')[-1].lower()
            if file_extension not in allowed_extensions:
                raise serializers.ValidationError(
                    f"File {file.name} has unsupported format. Allowed types: {', '.join(allowed_extensions)}"
                )
        
        return value


class FileProcessingRequestSerializer(serializers.Serializer):
    """Serializer for requesting file processing"""
    file_ids = serializers.ListField(
        child=serializers.UUIDField(),
        max_length=5  # Max 5 files at once
    )
    job_type = serializers.ChoiceField(choices=DocumentProcessingJob.JOB_TYPES)
    priority = serializers.IntegerField(min_value=1, max_value=10, default=5)
    
    def validate_file_ids(self, value):
        """Validate that files exist and belong to user"""
        user = self.context['request'].user
        existing_files = UploadedFile.objects.filter(
            id__in=value, 
            user=user
        ).values_list('id', flat=True)
        
        if len(existing_files) != len(value):
            raise serializers.ValidationError("Some files not found or access denied")
        
        return value


# Analytics and reporting serializers
class FileUploadStatsSerializer(serializers.Serializer):
    """Serializer for file upload statistics"""
    total_files = serializers.IntegerField()
    total_size = serializers.IntegerField()
    files_by_type = serializers.DictField()
    files_by_status = serializers.DictField()
    recent_uploads = UploadedFileSerializer(many=True)


class ProcessingJobStatsSerializer(serializers.Serializer):
    """Serializer for processing job statistics"""
    total_jobs = serializers.IntegerField()
    jobs_by_status = serializers.DictField()
    jobs_by_type = serializers.DictField()
    average_processing_time = serializers.FloatField()
    recent_jobs = DocumentProcessingJobSerializer(many=True)


# Search and filter serializers
class FileSearchSerializer(serializers.Serializer):
    """Serializer for file search parameters"""
    query = serializers.CharField(required=False, allow_blank=True)
    file_type = serializers.ChoiceField(
        choices=UploadedFile.FILE_TYPES,
        required=False
    )
    status = serializers.ChoiceField(
        choices=UploadedFile.STATUS_CHOICES,
        required=False
    )
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    is_public = serializers.BooleanField(required=False)
    ordering = serializers.ChoiceField(
        choices=['created_at', '-created_at', 'original_filename', '-original_filename'],
        default='-created_at'
    )


class JobSearchSerializer(serializers.Serializer):
    """Serializer for job search parameters"""
    job_type = serializers.ChoiceField(
        choices=DocumentProcessingJob.JOB_TYPES,
        required=False
    )
    status = serializers.ChoiceField(
        choices=DocumentProcessingJob.STATUS_CHOICES,
        required=False
    )
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    ordering = serializers.ChoiceField(
        choices=['created_at', '-created_at', 'priority', '-priority'],
        default='-created_at'
    )
