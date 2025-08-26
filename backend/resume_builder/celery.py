import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'resume_builder.settings')

app = Celery('resume_builder')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


# Celery Beat Schedule
app.conf.beat_schedule = {
    'cleanup-expired-exports': {
        'task': 'resumes.tasks.cleanup_expired_exports',
        'schedule': 3600.0,  # Every hour
    },
    'cleanup-old-uploads': {
        'task': 'uploads.tasks.cleanup_old_uploads',
        'schedule': 86400.0,  # Daily
    },
    'update-template-usage': {
        'task': 'templates.tasks.update_template_usage_stats',
        'schedule': 3600.0,  # Every hour
    },
    'generate-ats-reports': {
        'task': 'ats_scoring.tasks.generate_pending_ats_reports',
        'schedule': 300.0,  # Every 5 minutes
    },
}
