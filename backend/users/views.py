from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .models import User, UserActivity
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    CustomTokenObtainPairSerializer, PasswordChangeSerializer,
    PasswordResetSerializer, UserProfileUpdateSerializer,
    SocialLoginSerializer, UserActivitySerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain view with user data"""
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Track activity
        UserActivity.objects.create(
            user=user,
            activity_type='login',
            description='User registered',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """User login endpoint"""
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        login(request, user)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Track activity
        UserActivity.objects.create(
            user=user,
            activity_type='login',
            description='User logged in',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'message': 'Login successful'
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_logout(request):
    """User logout endpoint"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        logout(request)
        
        # Track activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='logout',
            description='User logged out',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({'message': 'Logout successful'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view and update"""
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserProfileUpdateSerializer


class PasswordChangeView(generics.GenericAPIView):
    """Password change endpoint"""
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Track activity
        UserActivity.objects.create(
            user=user,
            activity_type='login',
            description='Password changed',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({'message': 'Password changed successfully'})


class PasswordResetView(generics.GenericAPIView):
    """Password reset request endpoint"""
    serializer_class = PasswordResetSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate password reset token
        refresh = RefreshToken.for_user(user)
        
        # TODO: Send password reset email
        # For now, just return success
        return Response({
            'message': 'Password reset email sent',
            'token': str(refresh.access_token)  # In production, send via email
        })


class UserActivityView(generics.ListAPIView):
    """User activity history"""
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserActivity.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def social_login(request):
    """Social login endpoint"""
    serializer = SocialLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    provider = serializer.validated_data['provider']
    access_token = serializer.validated_data['access_token']
    
    # TODO: Implement social login logic
    # This would involve:
    # 1. Validating the access token with the provider
    # 2. Getting user info from the provider
    # 3. Creating or updating the user
    # 4. Generating JWT tokens
    
    return Response({
        'message': f'Social login with {provider} not implemented yet'
    }, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard(request):
    """User dashboard data"""
    user = request.user
    
    # Get user statistics
    stats = {
        'total_resumes': user.resumes.count() if hasattr(user, 'resumes') else 0,
        'total_activities': user.activities.count(),
        'last_login': user.last_login,
        'member_since': user.date_joined,
    }
    
    return Response({
        'user': UserSerializer(user).data,
        'stats': stats
    })
