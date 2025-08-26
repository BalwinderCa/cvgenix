from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
import os
import uuid

from .models import UploadedFile, DocumentProcessingJob, FileShare, FileAnalytics
from .serializers import (
    UploadedFileSerializer, UploadedFileCreateSerializer, UploadedFileUpdateSerializer,
    DocumentProcessingJobSerializer, DocumentProcessingJobUpdateSerializer,
    FileShareSerializer, FileShareUpdateSerializer,
    FileAnalyticsSerializer, FileAnalyticsUpdateSerializer,
    BulkFileUploadSerializer, FileProcessingRequestSerializer,
    FileUploadStatsSerializer, ProcessingJobStatsSerializer,
    FileSearchSerializer, JobSearchSerializer
)


class UploadedFileViewSet(viewsets.ModelViewSet):
    """ViewSet for UploadedFile model"""
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['file_type', 'status', 'is_public']
    search_fields = ['original_filename', 'extracted_text']
    ordering_fields = ['created_at', 'updated_at', 'file_size', 'original_filename']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter queryset to user's files"""
        return UploadedFile.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'create':
            return UploadedFileCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UploadedFileUpdateSerializer
        return UploadedFileSerializer

    def perform_create(self, serializer):
        """Set user when creating file"""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Request processing for a file"""
        uploaded_file = self.get_object()
        job_type = request.data.get('job_type', 'text_extraction')
        priority = request.data.get('priority', 5)

        # Create processing job
        job = DocumentProcessingJob.objects.create(
            user=request.user,
            uploaded_file=uploaded_file,
            job_type=job_type,
            priority=priority
        )

        # Update file status
        uploaded_file.status = 'processing'
        uploaded_file.save()

        return Response({
            'message': 'Processing job created successfully',
            'job_id': job.id
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Share a file"""
        uploaded_file = self.get_object()
        shared_with_id = request.data.get('shared_with')
        email = request.data.get('email')
        permission = request.data.get('permission', 'view')
        expires_at = request.data.get('expires_at')

        if expires_at:
            expires_at = timezone.datetime.fromisoformat(expires_at.replace('Z', '+00:00'))

        share_data = {
            'file': uploaded_file,
            'shared_by': request.user,
            'permission': permission,
            'expires_at': expires_at
        }

        if shared_with_id:
            from django.contrib.auth.models import User
            try:
                shared_with = User.objects.get(id=shared_with_id)
                share_data['shared_with'] = shared_with
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        elif email:
            share_data['email'] = email
        else:
            return Response({'error': 'Either shared_with or email must be provided'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        share = FileShare.objects.create(**share_data)
        serializer = FileShareSerializer(share, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        """Record file download"""
        uploaded_file = self.get_object()
        
        # Update analytics
        analytics, created = FileAnalytics.objects.get_or_create(file=uploaded_file)
        analytics.download_count += 1
        analytics.save()

        return Response({'message': 'Download recorded'})

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a file"""
        original_file = self.get_object()
        
        # Create a copy of the file
        import shutil
        new_filename = f"copy_{original_file.original_filename}"
        new_file_path = f"uploads/{request.user.id}/{uuid.uuid4()}_{new_filename}"
        
        # Copy the file
        shutil.copy2(original_file.file.path, f"media/{new_file_path}")
        
        # Create new UploadedFile instance
        new_file = UploadedFile.objects.create(
            user=request.user,
            file=new_file_path,
            original_filename=new_filename,
            file_type=original_file.file_type,
            file_size=original_file.file_size,
            mime_type=original_file.mime_type,
            is_public=original_file.is_public
        )

        serializer = UploadedFileSerializer(new_file, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        """Bulk upload multiple files"""
        serializer = BulkFileUploadSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            files = serializer.validated_data['files']
            file_type = serializer.validated_data['file_type']
            is_public = serializer.validated_data['is_public']

            uploaded_files = []
            for file in files:
                uploaded_file = UploadedFile.objects.create(
                    user=request.user,
                    file=file,
                    original_filename=file.name,
                    file_type=file_type,
                    mime_type=file.content_type,
                    is_public=is_public
                )
                uploaded_files.append(uploaded_file)

            result_serializer = UploadedFileSerializer(uploaded_files, many=True, context={'request': request})
            return Response({
                'message': f'{len(uploaded_files)} files uploaded successfully',
                'files': result_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def bulk_process(self, request):
        """Bulk process multiple files"""
        serializer = FileProcessingRequestSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            file_ids = serializer.validated_data['file_ids']
            job_type = serializer.validated_data['job_type']
            priority = serializer.validated_data['priority']

            jobs = []
            for file_id in file_ids:
                uploaded_file = UploadedFile.objects.get(id=file_id, user=request.user)
                job = DocumentProcessingJob.objects.create(
                    user=request.user,
                    uploaded_file=uploaded_file,
                    job_type=job_type,
                    priority=priority
                )
                jobs.append(job)

            return Response({
                'message': f'{len(jobs)} processing jobs created',
                'job_ids': [job.id for job in jobs]
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False)
    def stats(self, request):
        """Get file upload statistics"""
        user = request.user
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # Basic stats
        total_files = UploadedFile.objects.filter(user=user).count()
        total_size = UploadedFile.objects.filter(user=user).aggregate(
            total=Sum('file_size')
        )['total'] or 0

        # Files by type
        files_by_type = UploadedFile.objects.filter(user=user).values('file_type').annotate(
            count=Count('id')
        )

        # Files by status
        files_by_status = UploadedFile.objects.filter(user=user).values('status').annotate(
            count=Count('id')
        )

        # Recent uploads
        recent_uploads = UploadedFile.objects.filter(
            user=user, 
            created_at__gte=thirty_days_ago
        ).order_by('-created_at')[:10]

        stats = {
            'total_files': total_files,
            'total_size': total_size,
            'files_by_type': {item['file_type']: item['count'] for item in files_by_type},
            'files_by_status': {item['status']: item['count'] for item in files_by_status},
            'recent_uploads': UploadedFileSerializer(recent_uploads, many=True, context={'request': request}).data
        }

        return Response(stats)


class DocumentProcessingJobViewSet(viewsets.ModelViewSet):
    """ViewSet for DocumentProcessingJob model"""
    serializer_class = DocumentProcessingJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job_type', 'status', 'priority']
    ordering_fields = ['created_at', 'priority', 'progress']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter queryset to user's jobs"""
        return DocumentProcessingJob.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action in ['update', 'partial_update']:
            return DocumentProcessingJobUpdateSerializer
        return DocumentProcessingJobSerializer

    def perform_create(self, serializer):
        """Set user when creating job"""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a processing job"""
        job = self.get_object()
        
        if job.status in ['completed', 'failed', 'cancelled']:
            return Response({'error': 'Job cannot be cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        
        job.status = 'cancelled'
        job.save()
        
        return Response({'message': 'Job cancelled successfully'})

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Retry a failed job"""
        job = self.get_object()
        
        if job.status != 'failed':
            return Response({'error': 'Only failed jobs can be retried'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a new job with the same parameters
        new_job = DocumentProcessingJob.objects.create(
            user=request.user,
            uploaded_file=job.uploaded_file,
            job_type=job.job_type,
            priority=job.priority
        )
        
        return Response({
            'message': 'Job retry initiated',
            'new_job_id': new_job.id
        }, status=status.HTTP_201_CREATED)

    @action(detail=False)
    def stats(self, request):
        """Get processing job statistics"""
        user = request.user
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # Basic stats
        total_jobs = DocumentProcessingJob.objects.filter(user=user).count()
        
        # Jobs by status
        jobs_by_status = DocumentProcessingJob.objects.filter(user=user).values('status').annotate(
            count=Count('id')
        )
        
        # Jobs by type
        jobs_by_type = DocumentProcessingJob.objects.filter(user=user).values('job_type').annotate(
            count=Count('id')
        )
        
        # Average processing time
        completed_jobs = DocumentProcessingJob.objects.filter(
            user=user, 
            status='completed',
            completed_at__isnull=False,
            started_at__isnull=False
        )
        avg_processing_time = completed_jobs.aggregate(
            avg_time=Avg('completed_at' - 'started_at')
        )['avg_time']
        
        # Recent jobs
        recent_jobs = DocumentProcessingJob.objects.filter(
            user=user,
            created_at__gte=thirty_days_ago
        ).order_by('-created_at')[:10]

        stats = {
            'total_jobs': total_jobs,
            'jobs_by_status': {item['status']: item['count'] for item in jobs_by_status},
            'jobs_by_type': {item['job_type']: item['count'] for item in jobs_by_type},
            'average_processing_time': avg_processing_time.total_seconds() if avg_processing_time else 0,
            'recent_jobs': DocumentProcessingJobSerializer(recent_jobs, many=True, context={'request': request}).data
        }

        return Response(stats)


class FileShareViewSet(viewsets.ModelViewSet):
    """ViewSet for FileShare model"""
    serializer_class = FileShareSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['permission', 'is_active']
    ordering_fields = ['created_at', 'last_accessed']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter queryset to user's shares"""
        return FileShare.objects.filter(shared_by=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action in ['update', 'partial_update']:
            return FileShareUpdateSerializer
        return FileShareSerializer

    def perform_create(self, serializer):
        """Set shared_by when creating share"""
        serializer.save(shared_by=self.request.user)

    @action(detail=True, methods=['post'])
    def access(self, request, pk=None):
        """Record access to shared file"""
        share = self.get_object()
        
        # Update access count and last accessed time
        share.access_count += 1
        share.last_accessed = timezone.now()
        share.save()
        
        # Return file information
        file_serializer = UploadedFileSerializer(share.file, context={'request': request})
        return Response({
            'file': file_serializer.data,
            'permission': share.permission,
            'expires_at': share.expires_at
        })

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """Revoke a file share"""
        share = self.get_object()
        share.is_active = False
        share.save()
        
        return Response({'message': 'Share revoked successfully'})


class FileAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for FileAnalytics model (read-only)"""
    serializer_class = FileAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['view_count', 'download_count', 'share_count', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter queryset to user's file analytics"""
        return FileAnalytics.objects.filter(file__user=self.request.user)

    @action(detail=False)
    def summary(self, request):
        """Get analytics summary"""
        user = request.user
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # Total analytics
        total_views = FileAnalytics.objects.filter(file__user=user).aggregate(
            total=Sum('view_count')
        )['total'] or 0
        
        total_downloads = FileAnalytics.objects.filter(file__user=user).aggregate(
            total=Sum('download_count')
        )['total'] or 0
        
        total_shares = FileAnalytics.objects.filter(file__user=user).aggregate(
            total=Sum('share_count')
        )['total'] or 0

        # Recent activity
        recent_analytics = FileAnalytics.objects.filter(
            file__user=user,
            updated_at__gte=thirty_days_ago
        ).order_by('-updated_at')[:10]

        summary = {
            'total_views': total_views,
            'total_downloads': total_downloads,
            'total_shares': total_shares,
            'recent_activity': FileAnalyticsSerializer(recent_analytics, many=True, context={'request': request}).data
        }

        return Response(summary)
