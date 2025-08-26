from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Profile(models.Model):
    """
    User profile containing all resume data
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    # About section
    about = models.TextField(blank=True, help_text=_('Professional summary'))
    headline = models.CharField(max_length=200, blank=True, help_text=_('Professional headline'))
    
    # Contact information
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    
    # Social links
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    
    # Versioning
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'profiles'
        verbose_name = _('Profile')
        verbose_name_plural = _('Profiles')
    
    def __str__(self):
        return f"{self.user.email} - Profile v{self.version}"
    
    def create_new_version(self):
        """Create a new version of the profile"""
        new_profile = Profile.objects.create(
            user=self.user,
            about=self.about,
            headline=self.headline,
            phone=self.phone,
            location=self.location,
            website=self.website,
            linkedin_url=self.linkedin_url,
            github_url=self.github_url,
            twitter_url=self.twitter_url,
            portfolio_url=self.portfolio_url,
            version=self.version + 1
        )
        
        # Copy related data
        for education in self.education.all():
            Education.objects.create(
                profile=new_profile,
                institution=education.institution,
                degree=education.degree,
                field_of_study=education.field_of_study,
                start_date=education.start_date,
                end_date=education.end_date,
                gpa=education.gpa,
                description=education.description
            )
        
        for experience in self.experience.all():
            Experience.objects.create(
                profile=new_profile,
                company=experience.company,
                position=experience.position,
                location=experience.location,
                start_date=experience.start_date,
                end_date=experience.end_date,
                current=experience.current,
                description=experience.description
            )
        
        for skill in self.skills.all():
            Skill.objects.create(
                profile=new_profile,
                name=skill.name,
                category=skill.category,
                level=skill.level
            )
        
        for project in self.projects.all():
            Project.objects.create(
                profile=new_profile,
                title=project.title,
                description=project.description,
                url=project.url,
                start_date=project.start_date,
                end_date=project.end_date,
                technologies=project.technologies
            )
        
        for certification in self.certifications.all():
            Certification.objects.create(
                profile=new_profile,
                name=certification.name,
                issuing_organization=certification.issuing_organization,
                issue_date=certification.issue_date,
                expiry_date=certification.expiry_date,
                credential_id=certification.credential_id,
                credential_url=certification.credential_url
            )
        
        return new_profile


class Education(models.Model):
    """
    Education history
    """
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='education'
    )
    
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True
    )
    description = models.TextField(blank=True)
    
    # Ordering
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'education'
        verbose_name = _('Education')
        verbose_name_plural = _('Education')
        ordering = ['-end_date', '-start_date']
    
    def __str__(self):
        return f"{self.degree} at {self.institution}"


class Experience(models.Model):
    """
    Work experience
    """
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='experience'
    )
    
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    current = models.BooleanField(default=False)
    description = models.TextField()
    
    # Ordering
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'experience'
        verbose_name = _('Experience')
        verbose_name_plural = _('Experience')
        ordering = ['-end_date', '-start_date']
    
    def __str__(self):
        return f"{self.position} at {self.company}"
    
    def save(self, *args, **kwargs):
        if self.current:
            self.end_date = None
        super().save(*args, **kwargs)


class Skill(models.Model):
    """
    Skills and competencies
    """
    SKILL_CATEGORIES = (
        ('technical', 'Technical'),
        ('soft', 'Soft Skills'),
        ('language', 'Languages'),
        ('tool', 'Tools'),
        ('framework', 'Frameworks'),
        ('other', 'Other'),
    )
    
    SKILL_LEVELS = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    )
    
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=SKILL_CATEGORIES)
    level = models.CharField(max_length=20, choices=SKILL_LEVELS, blank=True)
    
    # Ordering
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'skills'
        verbose_name = _('Skill')
        verbose_name_plural = _('Skills')
        ordering = ['category', 'order', 'name']
        unique_together = ['profile', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class Project(models.Model):
    """
    Projects and portfolio items
    """
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    url = models.URLField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    technologies = models.JSONField(default=list, blank=True)
    
    # Ordering
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'projects'
        verbose_name = _('Project')
        verbose_name_plural = _('Projects')
        ordering = ['-end_date', '-start_date', 'order']
    
    def __str__(self):
        return self.title


class Certification(models.Model):
    """
    Certifications and licenses
    """
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='certifications'
    )
    
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True)
    
    # Ordering
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'certifications'
        verbose_name = _('Certification')
        verbose_name_plural = _('Certifications')
        ordering = ['-issue_date', 'order']
    
    def __str__(self):
        return f"{self.name} - {self.issuing_organization}"


class ProfileVersion(models.Model):
    """
    Track profile versions for rollback functionality
    """
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='versions'
    )
    
    version_number = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='profile_versions_created'
    )
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'profile_versions'
        verbose_name = _('Profile Version')
        verbose_name_plural = _('Profile Versions')
        ordering = ['-version_number']
        unique_together = ['profile', 'version_number']
    
    def __str__(self):
        return f"{self.profile.user.email} - v{self.version_number}"
