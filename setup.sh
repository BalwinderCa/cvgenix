#!/bin/bash

# Resume Builder Platform Setup Script

echo "🚀 Setting up Resume Builder Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p backend/media backend/staticfiles backend/logs
mkdir -p frontend/src frontend/public
mkdir -p nginx

# Set up environment variables
echo "🔧 Setting up environment variables..."
if [ ! -f .env ]; then
    cat > .env << EOF
# Django Settings
DEBUG=True
SECRET_KEY=django-insecure-development-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Settings
DB_NAME=resume_builder
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Redis Settings
REDIS_URL=redis://localhost:6379/0

# Email Settings (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=noreply@resumebuilder.com

# Social Auth Settings (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Build and start services
echo "🐳 Building and starting Docker services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run Django migrations
echo "🗄️ Running Django migrations..."
docker-compose exec backend python manage.py migrate

# Create superuser
echo "👤 Creating superuser..."
echo "You can create a superuser by running:"
echo "docker-compose exec backend python manage.py createsuperuser"

# Show service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🎉 Setup complete! Your Resume Builder Platform is running:"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 Admin Panel: http://localhost:8000/admin"
echo "🗄️ Database: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📝 Useful commands:"
echo "  Start services: docker-compose up -d"
echo "  Stop services: docker-compose down"
echo "  View logs: docker-compose logs -f"
echo "  Django shell: docker-compose exec backend python manage.py shell"
echo "  Create superuser: docker-compose exec backend python manage.py createsuperuser"
echo ""
echo "🔗 API Endpoints:"
echo "  - Authentication: http://localhost:8000/api/auth/"
echo "  - Profiles: http://localhost:8000/api/profiles/"
echo "  - Resumes: http://localhost:8000/api/resumes/"
echo "  - Templates: http://localhost:8000/api/templates/"
echo ""
echo "Happy coding! 🚀"
