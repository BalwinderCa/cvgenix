from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
import os
import uuid


def upload_to_path(instance, filename):
    """Generate unique file path for uploads"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"uploads/{instance.user.id}/{filename}"


class UploadedFile(models.Model):
    """Model for uploaded files"""
    FILE_TYPES = [
        ('resume', 'Resume'),
        ('cover_letter', 'Cover Letter'),
        ('certificate', 'Certificate'),
        ('portfolio', 'Portfolio'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')
    file = models.FileField(
        upload_to=upload_to_path,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'])]
    )
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20, choices=FILE_TYPES, default='other')
    file_size = models.BigIntegerField(help_text='File size in bytes')
    mime_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    processing_result = models.JSONField(null=True, blank=True)
    extracted_text = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Uploaded File'
        verbose_name_plural = 'Uploaded Files'
    
    def __str__(self):
        return f"{self.original_filename} - {self.user.username}"
    
    def save(self, *args, **kwargs):
        if not self.file_size and self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Delete the actual file when the model is deleted
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)


class DocumentProcessingJob(models.Model):
    """Model for document processing jobs"""
    JOB_TYPES = [
        ('text_extraction', 'Text Extraction'),
        ('resume_parsing', 'Resume Parsing'),
        ('ats_analysis', 'ATS Analysis'),
        ('format_conversion', 'Format Conversion'),
    ]
    
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='processing_jobs')
    uploaded_file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name='processing_jobs')
    job_type = models.CharField(max_length=30, choices=JOB_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    priority = models.IntegerField(default=5, help_text='1=highest, 10=lowest')
    progress = models.IntegerField(default=0, help_text='Progress percentage (0-100)')
    result = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['priority', '-created_at']
        verbose_name = 'Document Processing Job'
        verbose_name_plural = 'Document Processing Jobs'
    
    def __str__(self):
        return f"{self.job_type} - {self.uploaded_file.original_filename}"


class FileShare(models.Model):
    """Model for sharing uploaded files"""
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('download', 'Download'),
        ('edit', 'Edit'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name='shares')
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_files')
    shared_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_shares', null=True, blank=True)
    email = models.EmailField(null=True, blank=True, help_text='Email for external sharing')
    permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES, default='view')
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    access_count = models.IntegerField(default=0)
    last_accessed = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'File Share'
        verbose_name_plural = 'File Shares'
    
    def __str__(self):
        return f"{self.file.original_filename} shared by {self.shared_by.username}"


class FileAnalytics(models.Model):
    """Model for tracking file analytics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name='analytics')
    view_count = models.IntegerField(default=0)
    download_count = models.IntegerField(default=0)
    share_count = models.IntegerField(default=0)
    processing_time = models.FloatField(null=True, blank=True, help_text='Processing time in seconds')
    file_size_optimized = models.BigIntegerField(null=True, blank=True)
    compression_ratio = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'File Analytics'
        verbose_name_plural = 'File Analytics'
    
    def __str__(self):
        return f"Analytics for {self.file.original_filename}"
