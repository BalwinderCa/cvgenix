from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class ATSReport(models.Model):
    """
    Comprehensive ATS scoring report for resumes
    """
    resume = models.OneToOneField(
        'resumes.Resume',
        on_delete=models.CASCADE,
        related_name='ats_report'
    )
    
    # Overall score
    overall_score = models.PositiveIntegerField(help_text=_('Overall ATS score (0-100)'))
    
    # Individual dimension scores
    structure_score = models.PositiveIntegerField(help_text=_('Structure completeness score'))
    keyword_score = models.PositiveIntegerField(help_text=_('Keyword coverage score'))
    readability_score = models.PositiveIntegerField(help_text=_('Readability score'))
    bullet_score = models.PositiveIntegerField(help_text=_('Bullet point quality score'))
    hygiene_score = models.PositiveIntegerField(help_text=_('Document hygiene score'))
    length_score = models.PositiveIntegerField(help_text=_('Length and recency score'))
    
    # Detailed analysis
    analysis_data = models.JSONField(default=dict, help_text=_('Detailed analysis results'))
    
    # Recommendations
    recommendations = models.JSONField(default=list, help_text=_('Actionable recommendations'))
    
    # Job description analysis (if available)
    job_description = models.TextField(blank=True)
    job_keywords = models.JSONField(default=list, blank=True)
    keyword_matches = models.JSONField(default=dict, blank=True)
    missing_keywords = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ats_reports'
        verbose_name = _('ATS Report')
        verbose_name_plural = _('ATS Reports')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"ATS Report for {self.resume.title} - Score: {self.overall_score}"
    
    def get_score_level(self):
        """Get score level description"""
        if self.overall_score >= 80:
            return 'Excellent'
        elif self.overall_score >= 60:
            return 'Good'
        elif self.overall_score >= 40:
            return 'Fair'
        else:
            return 'Poor'
    
    def get_priority_recommendations(self, limit=3):
        """Get top priority recommendations"""
        return self.recommendations[:limit] if self.recommendations else []


class KeywordAnalysis(models.Model):
    """
    Detailed keyword analysis for ATS scoring
    """
    ats_report = models.ForeignKey(
        ATSReport,
        on_delete=models.CASCADE,
        related_name='keyword_analyses'
    )
    
    # Keyword information
    keyword = models.CharField(max_length=100)
    category = models.CharField(max_length=50, blank=True)
    importance = models.CharField(max_length=20, choices=[
        ('critical', 'Critical'),
        ('important', 'Important'),
        ('nice_to_have', 'Nice to Have'),
    ])
    
    # Analysis results
    found_in_resume = models.BooleanField(default=False)
    frequency = models.PositiveIntegerField(default=0)
    context = models.JSONField(default=list, blank=True)
    
    # Scoring
    score = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'keyword_analyses'
        verbose_name = _('Keyword Analysis')
        verbose_name_plural = _('Keyword Analyses')
        ordering = ['-importance', '-frequency']
    
    def __str__(self):
        return f"{self.keyword} - {self.get_importance_display()}"


class StructureAnalysis(models.Model):
    """
    Resume structure analysis
    """
    ats_report = models.OneToOneField(
        ATSReport,
        on_delete=models.CASCADE,
        related_name='structure_analysis'
    )
    
    # Section analysis
    sections_found = models.JSONField(default=list)
    sections_missing = models.JSONField(default=list)
    section_order = models.JSONField(default=list)
    
    # Format analysis
    has_contact_info = models.BooleanField(default=False)
    has_education = models.BooleanField(default=False)
    has_experience = models.BooleanField(default=False)
    has_skills = models.BooleanField(default=False)
    
    # Document structure
    page_count = models.PositiveIntegerField(default=1)
    word_count = models.PositiveIntegerField(default=0)
    character_count = models.PositiveIntegerField(default=0)
    
    # Issues found
    structure_issues = models.JSONField(default=list)
    formatting_issues = models.JSONField(default=list)
    
    class Meta:
        db_table = 'structure_analyses'
        verbose_name = _('Structure Analysis')
        verbose_name_plural = _('Structure Analyses')
    
    def __str__(self):
        return f"Structure Analysis for {self.ats_report.resume.title}"


class ReadabilityAnalysis(models.Model):
    """
    Readability and text quality analysis
    """
    ats_report = models.OneToOneField(
        ATSReport,
        on_delete=models.CASCADE,
        related_name='readability_analysis'
    )
    
    # Readability metrics
    flesch_reading_ease = models.FloatField(null=True, blank=True)
    flesch_kincaid_grade = models.FloatField(null=True, blank=True)
    gunning_fog_index = models.FloatField(null=True, blank=True)
    smog_index = models.FloatField(null=True, blank=True)
    
    # Text statistics
    average_sentence_length = models.FloatField(default=0)
    average_word_length = models.FloatField(default=0)
    sentence_count = models.PositiveIntegerField(default=0)
    paragraph_count = models.PositiveIntegerField(default=0)
    
    # Language analysis
    language_detected = models.CharField(max_length=10, default='en')
    grammar_errors = models.JSONField(default=list)
    spelling_errors = models.JSONField(default=list)
    
    # Readability issues
    readability_issues = models.JSONField(default=list)
    
    class Meta:
        db_table = 'readability_analyses'
        verbose_name = _('Readability Analysis')
        verbose_name_plural = _('Readability Analyses')
    
    def __str__(self):
        return f"Readability Analysis for {self.ats_report.resume.title}"


class BulletPointAnalysis(models.Model):
    """
    Bullet point quality analysis
    """
    ats_report = models.OneToOneField(
        ATSReport,
        on_delete=models.CASCADE,
        related_name='bullet_analysis'
    )
    
    # Bullet point statistics
    total_bullets = models.PositiveIntegerField(default=0)
    action_verb_bullets = models.PositiveIntegerField(default=0)
    quantified_bullets = models.PositiveIntegerField(default=0)
    weak_bullets = models.PositiveIntegerField(default=0)
    
    # Quality metrics
    average_bullet_length = models.FloatField(default=0)
    bullet_diversity_score = models.FloatField(default=0)
    
    # Action verbs analysis
    action_verbs_used = models.JSONField(default=list)
    action_verbs_missing = models.JSONField(default=list)
    
    # Quantification analysis
    quantified_achievements = models.JSONField(default=list)
    missing_quantification = models.JSONField(default=list)
    
    # Issues found
    bullet_issues = models.JSONField(default=list)
    improvement_suggestions = models.JSONField(default=list)
    
    class Meta:
        db_table = 'bullet_analyses'
        verbose_name = _('Bullet Point Analysis')
        verbose_name_plural = _('Bullet Point Analyses')
    
    def __str__(self):
        return f"Bullet Analysis for {self.ats_report.resume.title}"


class DocumentHygiene(models.Model):
    """
    Document hygiene and formatting analysis
    """
    ats_report = models.OneToOneField(
        ATSReport,
        on_delete=models.CASCADE,
        related_name='hygiene_analysis'
    )
    
    # Formatting issues
    has_headers_footers = models.BooleanField(default=False)
    has_page_numbers = models.BooleanField(default=False)
    has_watermarks = models.BooleanField(default=False)
    has_images = models.BooleanField(default=False)
    has_tables = models.BooleanField(default=False)
    
    # Font analysis
    font_count = models.PositiveIntegerField(default=1)
    font_sizes_used = models.JSONField(default=list)
    font_families_used = models.JSONField(default=list)
    
    # Color analysis
    color_count = models.PositiveIntegerField(default=1)
    colors_used = models.JSONField(default=list)
    has_background_colors = models.BooleanField(default=False)
    
    # Layout issues
    layout_issues = models.JSONField(default=list)
    formatting_issues = models.JSONField(default=list)
    
    # ATS compatibility
    ats_compatible = models.BooleanField(default=True)
    compatibility_issues = models.JSONField(default=list)
    
    class Meta:
        db_table = 'document_hygiene'
        verbose_name = _('Document Hygiene')
        verbose_name_plural = _('Document Hygiene')
    
    def __str__(self):
        return f"Hygiene Analysis for {self.ats_report.resume.title}"


class LengthAnalysis(models.Model):
    """
    Resume length and recency analysis
    """
    ats_report = models.OneToOneField(
        ATSReport,
        on_delete=models.CASCADE,
        related_name='length_analysis'
    )
    
    # Length metrics
    total_words = models.PositiveIntegerField(default=0)
    total_characters = models.PositiveIntegerField(default=0)
    total_pages = models.PositiveIntegerField(default=1)
    
    # Section lengths
    section_lengths = models.JSONField(default=dict)
    
    # Recency analysis
    most_recent_experience = models.DateField(null=True, blank=True)
    experience_recency_score = models.PositiveIntegerField(default=0)
    
    # Length recommendations
    optimal_length = models.PositiveIntegerField(default=500)
    length_score = models.PositiveIntegerField(default=0)
    length_recommendations = models.JSONField(default=list)
    
    class Meta:
        db_table = 'length_analyses'
        verbose_name = _('Length Analysis')
        verbose_name_plural = _('Length Analyses')
    
    def __str__(self):
        return f"Length Analysis for {self.ats_report.resume.title}"


class ATSRule(models.Model):
    """
    ATS rules and scoring criteria
    """
    RULE_TYPES = (
        ('keyword', 'Keyword Rule'),
        ('structure', 'Structure Rule'),
        ('formatting', 'Formatting Rule'),
        ('length', 'Length Rule'),
        ('content', 'Content Rule'),
    )
    
    name = models.CharField(max_length=200)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES)
    description = models.TextField()
    
    # Rule configuration
    rule_config = models.JSONField(default=dict)
    weight = models.FloatField(default=1.0, help_text=_('Weight in scoring algorithm'))
    
    # Rule status
    is_active = models.BooleanField(default=True)
    is_company_specific = models.BooleanField(default=False)
    
    # Company association (if applicable)
    company = models.CharField(max_length=200, blank=True)
    
    class Meta:
        db_table = 'ats_rules'
        verbose_name = _('ATS Rule')
        verbose_name_plural = _('ATS Rules')
        ordering = ['rule_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_rule_type_display()})"


class ScoringHistory(models.Model):
    """
    Track scoring history for analytics
    """
    resume = models.ForeignKey(
        'resumes.Resume',
        on_delete=models.CASCADE,
        related_name='scoring_history'
    )
    
    score = models.PositiveIntegerField()
    score_breakdown = models.JSONField(default=dict)
    
    # Scoring context
    job_description = models.TextField(blank=True)
    company_targeted = models.CharField(max_length=200, blank=True)
    
    # Timestamps
    scored_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'scoring_history'
        verbose_name = _('Scoring History')
        verbose_name_plural = _('Scoring History')
        ordering = ['-scored_at']
    
    def __str__(self):
        return f"{self.resume.title} - {self.score} - {self.scored_at}"
