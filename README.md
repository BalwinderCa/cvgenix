# Resume4Me - Professional Resume Creation Platform

A modern, full-stack resume builder application built with React.js and Node.js, featuring live preview, professional templates, and GitHub-based deployment.

## 🌐 Live Demo

**Visit the live application:** [https://resume4me.com](https://resume4me.com)

## 🚀 Features

- **Professional Templates**: 6+ ATS-optimized resume templates
- **Live Preview**: Real-time preview as you build your resume
- **Template System**: Modern, Classic, Creative, Minimal, Executive, and Tech templates
- **User Authentication**: Secure login and registration system
- **Resume Management**: Create, edit, and manage multiple resumes
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **PDF Export**: Download resumes in professional format
- **Mobile Responsive**: Works perfectly on all devices
- **GitHub Integration**: Seamless deployment workflow

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/BalwinderCa/resume-builder-platform.git
   cd resume-builder-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd server && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/resume4me
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   # From the root directory (starts both frontend and backend)
   npm run dev
   
   # Or start separately:
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🏗️ Project Structure

```
resume4me/
├── server/                 # Backend application
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── frontend/              # React application (Vite)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── App.jsx        # Main app component
│   ├── public/            # Static assets
│   └── vite.config.js     # Vite configuration
├── deploy.sh              # GitHub-based deployment script
├── package.json           # Root package.json
└── README.md             # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Resumes
- `GET /api/resumes` - Get user's resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/:id` - Get specific resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume
- `POST /api/resumes/:id/duplicate` - Duplicate resume

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get specific template
- `GET /api/templates/category/:category` - Get templates by category

### Health Check
- `GET /api/health` - API health status

## 🎨 Templates

The application includes 6 professional resume templates:

1. **Modern** - Clean and contemporary design with bold typography
2. **Classic** - Traditional and formal layout for conservative industries
3. **Creative** - Eye-catching design for creative professionals
4. **Minimal** - Simple and elegant design focusing on content
5. **Executive** - Sophisticated design for senior-level positions
6. **Tech** - Modern design perfect for technology professionals

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation and sanitization
- HTTPS enforcement in production

## 🚀 Deployment

### GitHub-Based Deployment

The project uses a streamlined GitHub-based deployment workflow:

1. **Deploy from GitHub**
   ```bash
   ./deploy.sh
   ```
   - Pulls latest code from GitHub
   - Fresh clone on server
   - Complete rebuild and deployment

2. **Manual GitHub Workflow**
   ```bash
   # 1. Commit and push to GitHub
   git add .
   git commit -m "Your commit message"
   git push origin main
   
   # 2. Deploy on server
   ./deploy.sh
   ```

### Production Environment

- **Live Site**: https://resume4me.com
- **API Endpoint**: https://resume4me.com/api
- **Server**: Ubuntu 24.04.3 LTS
- **Web Server**: Nginx with SSL
- **Database**: MongoDB
- **Process Manager**: PM2

### Deployment Scripts

- `deploy.sh` - Full GitHub-based deployment
- `sync.sh` - Quick sync with GitHub
- `push.sh` - Push code to GitHub only

## 🎯 Key Features

### Live Preview
- Real-time resume preview as you type
- Template switching with instant updates
- Professional formatting and layout

### Template System
- Multiple professional templates
- Easy template switching
- Customizable colors and styling

### User Experience
- Modern, intuitive interface
- Smooth animations and transitions
- Mobile-responsive design
- Fast loading with Vite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern resume builders
- Icons from Lucide React
- UI components styled with Tailwind CSS
- Animations powered by Framer Motion
- Build tooling with Vite

## 📞 Support

For support and questions:
- **Live Site**: https://resume4me.com
- **GitHub Issues**: [Repository Issues](https://github.com/BalwinderCa/resume-builder-platform/issues)
- **Email**: Contact through the live site

## 🚀 Quick Start

1. **Visit**: https://resume4me.com
2. **Sign up** for a free account
3. **Choose a template** from the collection
4. **Build your resume** with live preview
5. **Download** your professional resume

---

**Create your professional resume today! 🎉**

*Resume4Me - Transform your career with professional resumes*
