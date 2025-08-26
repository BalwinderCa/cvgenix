from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from profiles.models import Profile


class Resume(models.Model):
    """
    Resume model containing user's resume data
    """
    RESUME_STATUS = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resumes'
    )
    
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='resumes'
    )
    
    # Basic info
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Template and styling
    template = models.ForeignKey(
        'templates.Template',
        on_delete=models.SET_NULL,
        null=True,
        related_name='resumes'
    )
    
    # Content data (JSON format for flexibility)
    content = models.JSONField(default=dict)
    
    # Sections configuration
    sections = models.JSONField(default=dict, help_text=_('Section visibility and order'))
    
    # Status and versioning
    status = models.CharField(max_length=20, choices=RESUME_STATUS, default='draft')
    version = models.PositiveIntegerField(default=1)
    
    # Company targeting
    target_company = models.CharField(max_length=200, blank=True)
    job_description = models.TextField(blank=True)
    
    # ATS scoring
    ats_score = models.PositiveIntegerField(null=True, blank=True)
    ats_report = models.JSONField(default=dict, blank=True)
    
    # Export settings
    export_format = models.CharField(max_length=10, default='pdf', choices=[
        ('pdf', 'PDF'),
        ('docx', 'DOCX'),
    ])
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_exported = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'resumes'
        verbose_name = _('Resume')
        verbose_name_plural = _('Resumes')
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
    
    def create_new_version(self):
        """Create a new version of the resume"""
        new_resume = Resume.objects.create(
            user=self.user,
            profile=self.profile,
            title=self.title,
            description=self.description,
            template=self.template,
            content=self.content,
            sections=self.sections,
            status='draft',
            version=self.version + 1,
            target_company=self.target_company,
            job_description=self.job_description,
            export_format=self.export_format
        )
        return new_resume
    
    def get_content_section(self, section_name):
        """Get content for a specific section"""
        return self.content.get(section_name, {})
    
    def update_content_section(self, section_name, content):
        """Update content for a specific section"""
        self.content[section_name] = content
        self.save()
    
    def get_ats_score_display(self):
        """Get ATS score with color coding"""
        if self.ats_score is None:
            return "Not scored"
        elif self.ats_score >= 80:
            return f"{self.ats_score}/100 (Excellent)"
        elif self.ats_score >= 60:
            return f"{self.ats_score}/100 (Good)"
        else:
            return f"{self.ats_score}/100 (Needs improvement)"


class ResumeSection(models.Model):
    """
    Individual sections within a resume
    """
    SECTION_TYPES = (
        ('about', 'About'),
        ('contact', 'Contact'),
        ('education', 'Education'),
        ('experience', 'Experience'),
        ('skills', 'Skills'),
        ('projects', 'Projects'),
        ('certifications', 'Certifications'),
        ('languages', 'Languages'),
        ('volunteer', 'Volunteer'),
        ('awards', 'Awards'),
        ('publications', 'Publications'),
        ('custom', 'Custom'),
    )
    
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='resume_sections'
    )
    
    section_type = models.CharField(max_length=20, choices=SECTION_TYPES)
    title = models.CharField(max_length=200)
    content = models.JSONField(default=dict)
    is_visible = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    # Custom styling
    custom_styles = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'resume_sections'
        verbose_name = _('Resume Section')
        verbose_name_plural = _('Resume Sections')
        ordering = ['order']
        unique_together = ['resume', 'section_type']
    
    def __str__(self):
        return f"{self.resume.title} - {self.get_section_type_display()}"


class ResumeVersion(models.Model):
    """
    Track resume versions for rollback functionality
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='versions'
    )
    
    version_number = models.PositiveIntegerField()
    content = models.JSONField()
    sections = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='resume_versions_created'
    )
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'resume_versions'
        verbose_name = _('Resume Version')
        verbose_name_plural = _('Resume Versions')
        ordering = ['-version_number']
        unique_together = ['resume', 'version_number']
    
    def __str__(self):
        return f"{self.resume.title} - v{self.version_number}"


class ResumeExport(models.Model):
    """
    Track resume exports
    """
    EXPORT_FORMATS = (
        ('pdf', 'PDF'),
        ('docx', 'DOCX'),
        ('html', 'HTML'),
    )
    
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='exports'
    )
    
    format = models.CharField(max_length=10, choices=EXPORT_FORMATS)
    file_path = models.CharField(max_length=500)
    file_size = models.PositiveIntegerField(null=True, blank=True)
    
    # Export metadata
    export_settings = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'resume_exports'
        verbose_name = _('Resume Export')
        verbose_name_plural = _('Resume Exports')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.resume.title} - {self.format} - {self.created_at}"


class ResumeShare(models.Model):
    """
    Shareable resume links
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='shares'
    )
    
    share_token = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Access tracking
    view_count = models.PositiveIntegerField(default=0)
    last_viewed = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'resume_shares'
        verbose_name = _('Resume Share')
        verbose_name_plural = _('Resume Shares')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.resume.title} - {self.share_token}"
    
    def get_share_url(self):
        """Get the shareable URL"""
        from django.conf import settings
        return f"{settings.SITE_URL}/resume/share/{self.share_token}"
    
    def increment_view_count(self):
        """Increment view count and update last viewed"""
        from django.utils import timezone
        self.view_count += 1
        self.last_viewed = timezone.now()
        self.save()
