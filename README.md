# Resume4Me - Professional Resume Builder

A modern, full-stack resume builder application built with React.js and Node.js. Create professional resumes with beautiful templates, AI-powered suggestions, and instant PDF downloads.

## 🚀 Features

### Frontend (React.js)
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **50+ Professional Templates**: ATS-optimized templates for different industries
- **Real-time Preview**: See changes as you type
- **Drag & Drop**: Reorder sections easily
- **Multiple Export Formats**: PDF, Word, and PNG downloads
- **Mobile Responsive**: Works perfectly on all devices
- **Dark/Light Mode**: Customizable themes
- **Form Validation**: Comprehensive input validation
- **Auto-save**: Never lose your progress

### Backend (Node.js)
- **RESTful API**: Clean, well-documented endpoints
- **JWT Authentication**: Secure user authentication
- **File Upload**: Image upload and processing
- **PDF Generation**: Server-side PDF creation
- **Email Integration**: Password reset and notifications
- **Rate Limiting**: API protection
- **Error Handling**: Comprehensive error management

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **React Hook Form** - Form management
- **React Query** - Data fetching
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Puppeteer** - PDF generation
- **Nodemailer** - Email sending

## 📁 Project Structure

```
resume-builder-platform/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── server/                  # Node.js backend
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resume-builder-platform.git
   cd resume-builder-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../server && npm install
   ```

3. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/resume-builder
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   
   # Or start separately:
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📋 Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server
- `npm run install-all` - Install all dependencies

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 🎨 Features Overview

### Home Page
- Hero section with call-to-action
- Feature highlights
- Template showcase
- Testimonials
- Newsletter signup

### Templates Gallery
- Browse 50+ professional templates
- Filter by category
- Search functionality
- Template previews

### Resume Builder
- Multi-section form (Personal Info, Education, Experience, Skills, etc.)
- Real-time preview
- Drag-and-drop reordering
- Auto-save functionality
- Export to PDF/Word/PNG

### User Authentication
- Sign up/Sign in
- Password reset
- Profile management
- Subscription management

## 🔧 Configuration

### Frontend Configuration
The frontend uses Vite for building and development. Key configurations:

- **Vite Config**: `frontend/vite.config.js`
- **Tailwind Config**: `frontend/tailwind.config.js`
- **Environment Variables**: Create `.env` in frontend directory

### Backend Configuration
The backend uses Express.js with various middleware:

- **CORS**: Configured for frontend communication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **File Upload**: Configured for image uploads
- **PDF Generation**: Using Puppeteer

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your hosting service
```

### Backend Deployment
```bash
cd server
npm install --production
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/resume-builder-platform/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations
- All contributors and users of this project

---

**Made with ❤️ by the Resume4Me Team**
