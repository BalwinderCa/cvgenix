# Resume Builder Platform

A comprehensive resume building platform built with Django (Backend) and React (Frontend) that allows users to create, manage, and optimize their resumes with professional templates and ATS-friendly formatting.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - Secure JWT-based authentication
- **Profile Management** - Complete profile builder with education, experience, skills, projects, and certifications
- **Resume Builder** - Drag-and-drop resume creation with real-time preview
- **Template Gallery** - Professional resume templates with filtering and search
- **File Upload & Processing** - Document upload with text extraction and processing
- **ATS Optimization** - Resume scoring and optimization for Applicant Tracking Systems
- **Export Options** - PDF and DOCX export capabilities
- **File Sharing** - Secure file sharing with permission controls

### Advanced Features
- **Real-time Preview** - Live resume preview as you edit
- **Bulk Operations** - Upload and process multiple files
- **Analytics** - File usage and processing statistics
- **Responsive Design** - Mobile-friendly interface
- **Search & Filtering** - Advanced search and filter capabilities
- **Favorites System** - Save and organize favorite templates

## 🛠️ Tech Stack

### Backend
- **Django 5.0** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL/SQLite** - Database
- **JWT Authentication** - Token-based authentication
- **Celery** - Background task processing
- **Redis** - Caching and message broker

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **Framer Motion** - Animations

## 📁 Project Structure

```
resume-builder/
├── backend/                 # Django backend
│   ├── resume_builder/     # Main Django project
│   ├── users/              # User management app
│   ├── profiles/           # Profile management app
│   ├── resumes/            # Resume builder app
│   ├── templates/          # Template gallery app
│   ├── uploads/            # File upload app
│   ├── ats_scoring/        # ATS optimization app
│   ├── companies/          # Company profiles app
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   ├── public/             # Static files
│   └── package.json        # Node.js dependencies
├── docs/                   # Documentation
├── tests/                  # Test files
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume-builder
   ```

2. **Set up Python virtual environment**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up database**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Django Settings
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=1

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend Configuration

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_BASE_URL=http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/token/` - Get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token
- `POST /api/auth/register/` - User registration

### Profile Endpoints
- `GET /api/profiles/profiles/` - List user profiles
- `POST /api/profiles/profiles/` - Create profile
- `GET /api/profiles/profiles/{id}/` - Get profile details
- `PATCH /api/profiles/profiles/{id}/` - Update profile

### Resume Endpoints
- `GET /api/resumes/resumes/` - List user resumes
- `POST /api/resumes/resumes/` - Create resume
- `GET /api/resumes/resumes/{id}/` - Get resume details
- `PATCH /api/resumes/resumes/{id}/` - Update resume

### Template Endpoints
- `GET /api/templates/templates/` - List templates
- `GET /api/templates/templates/{id}/` - Get template details
- `POST /api/templates/templates/{id}/favorite/` - Add to favorites

### Upload Endpoints
- `POST /api/uploads/files/` - Upload file
- `GET /api/uploads/files/` - List uploaded files
- `POST /api/uploads/files/bulk_upload/` - Bulk upload
- `POST /api/uploads/jobs/` - Create processing job

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment (Django)
1. Set `DEBUG=False` in settings
2. Configure production database
3. Set up static file serving
4. Configure environment variables
5. Use Gunicorn or uWSGI

### Frontend Deployment (React)
1. Build the application: `npm run build`
2. Serve static files with nginx or similar
3. Configure API endpoint URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added ATS scoring and optimization
- **v1.2.0** - Enhanced template gallery and file management

## 🙏 Acknowledgments

- Django and React communities
- Material-UI for the component library
- Contributors and testers

---

**Built with ❤️ by the Resume Builder Team**
