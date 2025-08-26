from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Template(models.Model):
    """
    Resume template with JSON-based layout definitions
    """
    TEMPLATE_CATEGORIES = (
        ('modern', 'Modern'),
        ('classic', 'Classic'),
        ('creative', 'Creative'),
        ('minimal', 'Minimal'),
        ('professional', 'Professional'),
        ('executive', 'Executive'),
        ('student', 'Student'),
        ('freelancer', 'Freelancer'),
    )
    
    TEMPLATE_STATUS = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    )
    
    # Basic info
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=TEMPLATE_CATEGORIES)
    status = models.CharField(max_length=20, choices=TEMPLATE_STATUS, default='published')
    
    # Visual assets
    thumbnail = models.ImageField(upload_to='templates/thumbnails/', null=True, blank=True)
    preview_image = models.ImageField(upload_to='templates/previews/', null=True, blank=True)
    
    # Layout configuration (JSON-based)
    layout_config = models.JSONField(default=dict, help_text=_('JSON configuration for layout'))
    
    # Styling configuration
    styles = models.JSONField(default=dict, help_text=_('CSS styles and theme configuration'))
    
    # Section configuration
    sections = models.JSONField(default=dict, help_text=_('Available sections and their configuration'))
    
    # Template metadata
    is_premium = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    usage_count = models.PositiveIntegerField(default=0)
    
    # Versioning
    version = models.PositiveIntegerField(default=1)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='templates_created'
    )
    
    class Meta:
        db_table = 'templates'
        verbose_name = _('Template')
        verbose_name_plural = _('Templates')
        ordering = ['-is_featured', '-usage_count', '-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"
    
    def increment_usage(self):
        """Increment usage count"""
        self.usage_count += 1
        self.save()
    
    def get_default_layout(self):
        """Get default layout configuration"""
        return {
            'header': {
                'visible': True,
                'position': 'top',
                'height': 'auto',
                'background_color': '#ffffff',
                'border_bottom': '1px solid #e0e0e0'
            },
            'sidebar': {
                'visible': False,
                'position': 'left',
                'width': '250px',
                'background_color': '#f8f9fa'
            },
            'main_content': {
                'padding': '20px',
                'background_color': '#ffffff'
            },
            'footer': {
                'visible': False,
                'position': 'bottom',
                'height': 'auto',
                'background_color': '#f8f9fa'
            }
        }
    
    def get_default_styles(self):
        """Get default styling configuration"""
        return {
            'colors': {
                'primary': '#2c3e50',
                'secondary': '#7f8c8d',
                'accent': '#3498db',
                'background': '#ffffff',
                'text': '#2c3e50',
                'border': '#e0e0e0'
            },
            'typography': {
                'font_family': 'Arial, sans-serif',
                'heading_font': 'Arial, sans-serif',
                'body_font': 'Arial, sans-serif',
                'font_size': '12px',
                'line_height': '1.4'
            },
            'spacing': {
                'section_margin': '20px',
                'element_margin': '10px',
                'padding': '15px'
            }
        }


class TemplateSection(models.Model):
    """
    Individual sections within a template
    """
    SECTION_TYPES = (
        ('header', 'Header'),
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
    
    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name='template_sections'
    )
    
    section_type = models.CharField(max_length=20, choices=SECTION_TYPES)
    title = models.CharField(max_length=200)
    is_visible = models.BooleanField(default=True)
    is_required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    # Layout configuration
    layout_config = models.JSONField(default=dict)
    
    # Styling configuration
    styles = models.JSONField(default=dict)
    
    # Content configuration
    content_config = models.JSONField(default=dict, help_text=_('Content field configuration'))
    
    class Meta:
        db_table = 'template_sections'
        verbose_name = _('Template Section')
        verbose_name_plural = _('Template Sections')
        ordering = ['order']
        unique_together = ['template', 'section_type']
    
    def __str__(self):
        return f"{self.template.name} - {self.get_section_type_display()}"


class TemplateAsset(models.Model):
    """
    Assets (icons, images) for templates
    """
    ASSET_TYPES = (
        ('icon', 'Icon'),
        ('image', 'Image'),
        ('logo', 'Logo'),
        ('background', 'Background'),
        ('decoration', 'Decoration'),
    )
    
    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name='assets'
    )
    
    name = models.CharField(max_length=200)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPES)
    file = models.FileField(upload_to='templates/assets/')
    
    # Asset metadata
    alt_text = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    
    # Usage configuration
    is_required = models.BooleanField(default=False)
    default_position = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'template_assets'
        verbose_name = _('Template Asset')
        verbose_name_plural = _('Template Assets')
        ordering = ['asset_type', 'name']
    
    def __str__(self):
        return f"{self.template.name} - {self.name}"


class TemplateTheme(models.Model):
    """
    Predefined themes for templates
    """
    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name='themes'
    )
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Theme configuration
    colors = models.JSONField(default=dict)
    typography = models.JSONField(default=dict)
    spacing = models.JSONField(default=dict)
    
    # Preview
    preview_image = models.ImageField(upload_to='templates/themes/', null=True, blank=True)
    
    class Meta:
        db_table = 'template_themes'
        verbose_name = _('Template Theme')
        verbose_name_plural = _('Template Themes')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.template.name} - {self.name}"


class TemplateCategory(models.Model):
    """
    Template categories for organization
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#3498db')
    
    # Category settings
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'template_categories'
        verbose_name = _('Template Category')
        verbose_name_plural = _('Template Categories')
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name


class TemplateUsage(models.Model):
    """
    Track template usage for analytics
    """
    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name='usage_history'
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='template_usage'
    )
    
    resume = models.ForeignKey(
        'resumes.Resume',
        on_delete=models.CASCADE,
        related_name='template_usage'
    )
    
    used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'template_usage'
        verbose_name = _('Template Usage')
        verbose_name_plural = _('Template Usage')
        ordering = ['-used_at']
    
    def __str__(self):
        return f"{self.template.name} used by {self.user.email}"
