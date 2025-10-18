# CVGenix - AI-Powered Resume Builder

A modern, full-stack resume builder application built with Next.js 15 and React 19, featuring AI-powered ATS optimization, visual resume editor, and professional templates. Create stunning, ATS-friendly resumes in minutes with our intuitive drag-and-drop interface.

## 🚀 Features

### Core Features
- **🎨 Visual Resume Editor** - Drag-and-drop interface with real-time preview
- **🤖 AI-Powered ATS Optimization** - Get your resume past Applicant Tracking Systems
- **📄 Professional Templates** - Choose from multiple modern, recruiter-approved designs
- **📊 ATS Resume Analyzer** - Upload existing resumes for instant compatibility analysis
- **💾 Multiple Export Formats** - Export to PDF, DOCX, and PNG with one click
- **🔒 Secure Resume Sharing** - Share resumes with secure, private links
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile

### Advanced Features
- **🎯 Smart Content Suggestions** - AI-powered recommendations for better resume content
- **🔄 Real-time Collaboration** - Work on resumes with team members (coming soon)
- **📈 Progress Tracking** - Monitor your resume building progress and completion
- **🎨 Custom Styling** - Advanced color schemes, fonts, and layout customization
- **📋 Template Management** - Save and manage multiple resume versions
- **🔍 Keyword Optimization** - Industry-specific keyword suggestions
- **📊 Analytics Dashboard** - Track resume performance and views

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router and Turbopack
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Radix UI** - Accessible component primitives
- **Fabric.js** - Canvas manipulation for visual editor
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Authentication and authorization
- **Socket.io** - Real-time communication
- **Puppeteer** - PDF generation and web scraping
- **OpenAI API** - AI-powered content optimization
- **Cloudinary** - Image and file management
- **Stripe** - Payment processing

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple npm scripts
- **Jest** - Testing framework
- **Winston** - Logging system

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cvgenix
```

### 2. Install Dependencies

#### Quick Setup (Recommended)
Install all dependencies at once:
```bash
npm run install-all
```

#### Manual Setup
If you prefer to install dependencies separately:

**Frontend Setup**
```bash
cd frontend
npm install
```

**Backend Setup**
```bash
cd server
npm install
```

### 3. Environment Configuration

#### Frontend Environment
Create a `.env.local` file in the `frontend` directory:

```bash
# Copy the example environment file
cp env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Add other frontend environment variables as needed
```

#### Backend Environment
Create a `.env` file in the `server` directory:

```bash
# Copy the example environment file
cp env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
# Add other backend environment variables as needed
```

### 4. Database Setup

Make sure your database is configured and running. Update the `DATABASE_URL` in your server `.env` file.

### 5. Start the Development Servers

#### Option 1: Start Both Servers (Recommended)
```bash
npm run dev
```
This will start both frontend and backend servers concurrently.

#### Option 2: Start Servers Separately

**Terminal 1 - Backend Server**
```bash
npm run server
# or
cd server && npm run dev
```

**Terminal 2 - Frontend Server**
```bash
npm run client
# or
cd frontend && npm run dev
```

### 6. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000) (or 3002 if 3000 is in use)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Resume Builder**: [http://localhost:3000/resume-builder](http://localhost:3000/resume-builder)
- **ATS Analyzer**: [http://localhost:3000/#ats](http://localhost:3000/#ats)

## 🏗️ Project Structure

```
cvgenix/
├── frontend/                    # Next.js 15 frontend application
│   ├── src/
│   │   ├── app/                # App Router pages and layouts
│   │   │   ├── resume-builder/ # Visual resume builder page
│   │   │   ├── help/          # Help and documentation
│   │   │   └── page.tsx       # Landing page
│   │   ├── components/         # React components (82 files)
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── resume-builder-canvas.tsx    # Main canvas editor
│   │   │   ├── resume-builder-sidebar.tsx   # Editor sidebar
│   │   │   ├── ats-upload-box.tsx          # ATS analyzer upload
│   │   │   ├── hero-section.tsx            # Landing page hero
│   │   │   ├── features-section.tsx        # Features showcase
│   │   │   └── templates-showcase.tsx      # Template gallery
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions and services
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript type definitions
│   │   └── visual-edits/      # Visual editing utilities
│   ├── public/                # Static assets
│   │   └── assets/           # Images and icons
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── package.json
├── server/                     # Node.js backend API
│   ├── routes/                # Express API routes (8 files)
│   │   ├── auth.js           # Authentication routes
│   │   ├── resume.js         # Resume CRUD operations
│   │   ├── template.js       # Template management
│   │   └── ats.js            # ATS analysis endpoints
│   ├── models/                # MongoDB models (3 files)
│   │   ├── User.js           # User schema
│   │   ├── Resume.js         # Resume schema
│   │   └── Template.js       # Template schema
│   │   ├── middleware/        # Express middleware (2 files)
│   │   ├── services/          # Business logic (7 files)
│   │   │   ├── paymentService.js    # Stripe integration
│   │   │   ├── emailService.js      # Email notifications
│   │   │   └── atsService.js        # ATS analysis logic
│   │   ├── utils/             # Utility functions (6 files)
│   │   │   └── simpleATSAnalyzer.js # ATS analysis engine
│   │   ├── templates/         # Email templates (4 files)
│   │   ├── uploads/           # File uploads directory
│   │   ├── logs/              # Application logs
│   │   └── package.json
├── logs/                       # ATS analysis logs
├── package.json               # Root package.json with scripts
└── README.md
```

## 🚀 Available Scripts

### Root Scripts (Run from project root)
```bash
npm run dev          # Start both frontend and backend servers concurrently
npm run server       # Start only the backend server
npm run client       # Start only the frontend server
npm run build        # Build frontend for production
npm run start        # Start production server
npm run install-all  # Install dependencies for all packages
```

### Frontend Scripts (Run from frontend/ directory)
```bash
npm run dev          # Start Next.js development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Scripts (Run from server/ directory)
```bash
npm start            # Start production server
npm run dev          # Start development server
npm run dev:tsx      # Start development server with tsx watch
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 🔧 Development

### Visual Editor Architecture

The resume builder uses a sophisticated visual editing system:

- **Fabric.js Canvas**: Core canvas manipulation for drag-and-drop editing
- **Canvas Manager Hook**: Centralized state management for canvas operations
- **Template System**: Modular template loading and customization
- **Real-time Preview**: Live updates as users edit their resumes
- **Export Engine**: Multi-format export (PDF, DOCX, PNG) with high fidelity

### Key Components

- **`resume-builder-canvas.tsx`**: Main canvas editor with Fabric.js integration
- **`resume-builder-sidebar.tsx`**: Comprehensive editing toolbar and controls
- **`template-sidebar.tsx`**: Template selection and customization panel
- **`ats-upload-box.tsx`**: File upload component for ATS analysis

### Adding New Features

1. **Create feature branches** from `main`
2. **Follow the existing code structure**:
   - Components in `frontend/src/components/`
   - API routes in `server/routes/`
   - Business logic in `server/services/`
3. **Add proper error handling** and validation
4. **Write tests** for new functionality
5. **Update documentation** and type definitions

### Development Workflow

1. **Frontend Development**:
   ```bash
   cd frontend
   npm run dev  # Starts with Turbopack for fast rebuilds
   ```

2. **Backend Development**:
   ```bash
   cd server
   npm run dev  # Starts with auto-reload
   ```

3. **Full Stack Development**:
   ```bash
   npm run dev  # Starts both servers concurrently
   ```

### Code Style & Standards

- **TypeScript**: Use strict typing for all new code
- **ESLint**: Follow the configured linting rules
- **Prettier**: Automatic code formatting on save
- **Component Structure**: Use functional components with hooks
- **State Management**: Use React hooks and context for state
- **API Design**: RESTful endpoints with proper error handling
- **Database**: Use Mongoose schemas with validation
- **Testing**: Write unit tests for utilities and integration tests for APIs

### Canvas Development

When working with the visual editor:

- **Fabric.js Objects**: Extend Fabric.js objects for custom functionality
- **Event Handling**: Use proper event delegation for canvas interactions
- **Performance**: Implement object pooling for large documents
- **Accessibility**: Ensure keyboard navigation and screen reader support

## 🐛 Troubleshooting

### Common Issues

**Dependency Conflicts**
```bash
# If you encounter ERESOLVE errors
npm install --legacy-peer-deps
```

**Port Already in Use**
```bash
# Kill process using port 3000 or 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Database Connection Issues**
- Verify your database is running
- Check the `DATABASE_URL` in your `.env` file
- Ensure database credentials are correct

## 📦 Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**:
   - Link your GitHub repository to Vercel
   - Set build command: `cd frontend && npm run build`
   - Set output directory: `frontend/.next`

2. **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   NEXT_PUBLIC_APP_URL=https://your-app-domain.com
   ```

3. **Automatic Deployment**:
   - Deploys automatically on push to `main` branch
   - Preview deployments for pull requests

### Backend Deployment

#### Option 1: Railway
1. **Connect Repository**:
   - Link your GitHub repository to Railway
   - Set root directory to `server/`

2. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

#### Option 2: Render
1. **Create Web Service**:
   - Connect GitHub repository
   - Set build command: `cd server && npm install`
   - Set start command: `cd server && npm start`

2. **Database Setup**:
   - Use MongoDB Atlas for production database
   - Configure connection string in environment variables

### Production Checklist

- [ ] **Database**: Set up MongoDB Atlas cluster
- [ ] **Environment Variables**: Configure all required variables
- [ ] **SSL Certificates**: Ensure HTTPS is enabled
- [ ] **Domain Configuration**: Set up custom domains
- [ ] **Monitoring**: Set up error tracking and logging
- [ ] **Backup Strategy**: Configure database backups
- [ ] **Performance**: Enable CDN and caching
- [ ] **Security**: Configure CORS and rate limiting

### Environment Configuration

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.cvgenix.com
NEXT_PUBLIC_APP_URL=https://cvgenix.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

#### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information

## 🔍 ATS Resume Analyzer

CVGenix includes a powerful ATS (Applicant Tracking System) analyzer that helps optimize your resume:

### Features
- **File Upload Support**: PDF, DOC, and DOCX formats
- **Keyword Analysis**: Industry-specific keyword suggestions
- **Format Compatibility**: ATS-friendly formatting recommendations
- **Real-time Feedback**: Instant optimization suggestions
- **Security**: SSL encryption and automatic file deletion

### How It Works
1. Upload your existing resume (PDF, DOC, or DOCX)
2. Get instant analysis of ATS compatibility
3. Receive specific recommendations for improvement
4. Download optimized version or use insights in the builder

### API Endpoints
- `POST /api/ats/analyze` - Analyze uploaded resume
- `GET /api/ats/analysis/:id` - Get analysis results
- `DELETE /api/ats/analysis/:id` - Delete analysis data

## 🔗 Links

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [Fabric.js Documentation](http://fabricjs.com/docs/)

### Tools & Services
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app/)
- [Stripe Integration](https://stripe.com/docs)

---

**Happy coding! 🎉**

*Built with ❤️ by the CVGenix Team*