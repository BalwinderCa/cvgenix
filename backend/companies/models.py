from django.db import models
from django.utils.translation import gettext_lazy as _


class Company(models.Model):
    """
    Company profiles for resume tailoring
    """
    COMPANY_TYPES = (
        ('tech', 'Technology'),
        ('finance', 'Finance'),
        ('healthcare', 'Healthcare'),
        ('education', 'Education'),
        ('consulting', 'Consulting'),
        ('retail', 'Retail'),
        ('manufacturing', 'Manufacturing'),
        ('government', 'Government'),
        ('nonprofit', 'Non-Profit'),
        ('startup', 'Startup'),
        ('enterprise', 'Enterprise'),
        ('other', 'Other'),
    )
    
    # Basic information
    name = models.CharField(max_length=200, unique=True)
    display_name = models.CharField(max_length=200)
    company_type = models.CharField(max_length=20, choices=COMPANY_TYPES)
    
    # Company details
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='companies/logos/', null=True, blank=True)
    
    # Location
    headquarters = models.CharField(max_length=200, blank=True)
    locations = models.JSONField(default=list, blank=True)
    
    # Company size
    employee_count = models.CharField(max_length=50, blank=True)
    founded_year = models.PositiveIntegerField(null=True, blank=True)
    
    # Industry information
    industry = models.CharField(max_length=100, blank=True)
    sub_industry = models.CharField(max_length=100, blank=True)
    
    # Company status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'companies'
        verbose_name = _('Company')
        verbose_name_plural = _('Companies')
        ordering = ['name']
    
    def __str__(self):
        return self.display_name


class CompanyProfile(models.Model):
    """
    Detailed company profile for resume tailoring
    """
    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    # Company culture and values
    mission_statement = models.TextField(blank=True)
    values = models.JSONField(default=list, blank=True)
    culture_keywords = models.JSONField(default=list, blank=True)
    
    # Hiring preferences
    hiring_preferences = models.JSONField(default=dict, blank=True)
    preferred_qualifications = models.JSONField(default=list, blank=True)
    
    # Resume preferences
    resume_preferences = models.JSONField(default=dict, blank=True)
    preferred_format = models.CharField(max_length=20, default='pdf', choices=[
        ('pdf', 'PDF'),
        ('docx', 'DOCX'),
        ('txt', 'Text'),
    ])
    
    # ATS system information
    ats_system = models.CharField(max_length=100, blank=True)
    ats_requirements = models.JSONField(default=dict, blank=True)
    
    # File naming conventions
    file_naming_convention = models.CharField(max_length=200, blank=True)
    file_naming_examples = models.JSONField(default=list, blank=True)
    
    # Application process
    application_process = models.TextField(blank=True)
    application_deadlines = models.JSONField(default=dict, blank=True)
    
    # Contact information
    hr_email = models.EmailField(blank=True)
    careers_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    
    class Meta:
        db_table = 'company_profiles'
        verbose_name = _('Company Profile')
        verbose_name_plural = _('Company Profiles')
    
    def __str__(self):
        return f"Profile for {self.company.name}"


class CompanyKeyword(models.Model):
    """
    Keywords and skills important to specific companies
    """
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='keywords'
    )
    
    # Keyword information
    keyword = models.CharField(max_length=100)
    category = models.CharField(max_length=50, blank=True)
    importance = models.CharField(max_length=20, choices=[
        ('critical', 'Critical'),
        ('important', 'Important'),
        ('preferred', 'Preferred'),
        ('nice_to_have', 'Nice to Have'),
    ])
    
    # Keyword details
    description = models.TextField(blank=True)
    synonyms = models.JSONField(default=list, blank=True)
    related_keywords = models.JSONField(default=list, blank=True)
    
    # Usage context
    context = models.TextField(blank=True)
    examples = models.JSONField(default=list, blank=True)
    
    # Scoring weight
    weight = models.FloatField(default=1.0)
    
    class Meta:
        db_table = 'company_keywords'
        verbose_name = _('Company Keyword')
        verbose_name_plural = _('Company Keywords')
        ordering = ['-importance', 'keyword']
        unique_together = ['company', 'keyword']
    
    def __str__(self):
        return f"{self.keyword} - {self.company.name}"


class CompanyJobRole(models.Model):
    """
    Job roles and positions at specific companies
    """
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='job_roles'
    )
    
    # Job information
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100, blank=True)
    level = models.CharField(max_length=50, blank=True)
    
    # Job details
    description = models.TextField(blank=True)
    requirements = models.JSONField(default=list, blank=True)
    responsibilities = models.JSONField(default=list, blank=True)
    
    # Required skills
    required_skills = models.JSONField(default=list, blank=True)
    preferred_skills = models.JSONField(default=list, blank=True)
    
    # Experience requirements
    min_experience = models.PositiveIntegerField(null=True, blank=True)
    max_experience = models.PositiveIntegerField(null=True, blank=True)
    
    # Education requirements
    education_requirements = models.JSONField(default=list, blank=True)
    
    # Salary information
    salary_range = models.JSONField(default=dict, blank=True)
    benefits = models.JSONField(default=list, blank=True)
    
    # Job status
    is_active = models.BooleanField(default=True)
    is_remote = models.BooleanField(default=False)
    locations = models.JSONField(default=list, blank=True)
    
    class Meta:
        db_table = 'company_job_roles'
        verbose_name = _('Company Job Role')
        verbose_name_plural = _('Company Job Roles')
        ordering = ['company', 'department', 'title']
    
    def __str__(self):
        return f"{self.title} at {self.company.name}"


class CompanyTailoringRule(models.Model):
    """
    Rules for tailoring resumes to specific companies
    """
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='tailoring_rules'
    )
    
    # Rule information
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    # Rule type
    rule_type = models.CharField(max_length=20, choices=[
        ('keyword', 'Keyword Rule'),
        ('format', 'Format Rule'),
        ('content', 'Content Rule'),
        ('style', 'Style Rule'),
        ('section', 'Section Rule'),
    ])
    
    # Rule configuration
    rule_config = models.JSONField(default=dict)
    priority = models.PositiveIntegerField(default=1)
    
    # Rule conditions
    conditions = models.JSONField(default=dict, blank=True)
    
    # Rule actions
    actions = models.JSONField(default=list)
    
    # Rule status
    is_active = models.BooleanField(default=True)
    is_automatic = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'company_tailoring_rules'
        verbose_name = _('Company Tailoring Rule')
        verbose_name_plural = _('Company Tailoring Rules')
        ordering = ['company', 'priority', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"


class CompanyApplication(models.Model):
    """
    Track applications to specific companies
    """
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='company_applications'
    )
    
    resume = models.ForeignKey(
        'resumes.Resume',
        on_delete=models.CASCADE,
        related_name='company_applications'
    )
    
    # Application details
    job_title = models.CharField(max_length=200, blank=True)
    job_id = models.CharField(max_length=100, blank=True)
    application_date = models.DateTimeField(auto_now_add=True)
    
    # Application status
    status = models.CharField(max_length=20, choices=[
        ('applied', 'Applied'),
        ('reviewing', 'Under Review'),
        ('interviewing', 'Interviewing'),
        ('offered', 'Offer Received'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ], default='applied')
    
    # Application metadata
    application_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    
    # Follow-up information
    follow_up_date = models.DateField(null=True, blank=True)
    follow_up_notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'company_applications'
        verbose_name = _('Company Application')
        verbose_name_plural = _('Company Applications')
        ordering = ['-application_date']
        unique_together = ['company', 'user', 'resume']
    
    def __str__(self):
        return f"{self.user.email} - {self.company.name} - {self.job_title}"


class CompanyInsight(models.Model):
    """
    Insights and tips for applying to specific companies
    """
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='insights'
    )
    
    # Insight information
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=50, choices=[
        ('application', 'Application Process'),
        ('culture', 'Company Culture'),
        ('interview', 'Interview Tips'),
        ('resume', 'Resume Tips'),
        ('networking', 'Networking'),
        ('general', 'General'),
    ])
    
    # Insight details
    source = models.CharField(max_length=200, blank=True)
    source_url = models.URLField(blank=True)
    author = models.CharField(max_length=200, blank=True)
    
    # Insight metadata
    is_featured = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    helpful_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'company_insights'
        verbose_name = _('Company Insight')
        verbose_name_plural = _('Company Insights')
        ordering = ['-is_featured', '-helpful_count', '-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.company.name}"
