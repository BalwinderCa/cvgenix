from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom User model for Resume Builder Platform
    """
    USER_ROLES = (
        ('guest', 'Guest'),
        ('user', 'User'),
        ('admin', 'Admin'),
    )
    
    # Extended fields
    role = models.CharField(
        max_length=10,
        choices=USER_ROLES,
        default='user',
        help_text=_('User role in the system')
    )
    
    # Profile information
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text=_('User profile picture')
    )
    
    # Social login fields
    google_id = models.CharField(max_length=100, null=True, blank=True)
    github_id = models.CharField(max_length=100, null=True, blank=True)
    linkedin_id = models.CharField(max_length=100, null=True, blank=True)
    
    # Preferences
    email_notifications = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
    
    def __str__(self):
        return self.email or self.username
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_guest(self):
        return self.role == 'guest'
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def get_social_provider(self):
        """Get the primary social login provider"""
        if self.google_id:
            return 'google'
        elif self.github_id:
            return 'github'
        elif self.linkedin_id:
            return 'linkedin'
        return None


class UserSession(models.Model):
    """
    Track user sessions for analytics and security
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'user_sessions'
        verbose_name = _('User Session')
        verbose_name_plural = _('User Sessions')
    
    def __str__(self):
        return f"{self.user.email} - {self.created_at}"


class UserActivity(models.Model):
    """
    Track user activities for analytics
    """
    ACTIVITY_TYPES = (
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('resume_created', 'Resume Created'),
        ('resume_updated', 'Resume Updated'),
        ('resume_exported', 'Resume Exported'),
        ('template_used', 'Template Used'),
        ('ats_scored', 'ATS Scored'),
        ('cv_uploaded', 'CV Uploaded'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_activities'
        verbose_name = _('User Activity')
        verbose_name_plural = _('User Activities')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.activity_type} - {self.created_at}"
