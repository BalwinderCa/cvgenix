# CVGenix - AI-Powered Resume Builder

A modern, full-stack resume builder application built with Next.js, featuring AI-powered ATS optimization, real-time collaboration, and professional resume templates.

## 🚀 Features

- **AI-Powered ATS Optimization** - Get your resume past Applicant Tracking Systems
- **Professional Templates** - Choose from multiple modern resume designs
- **Real-time Collaboration** - Work on resumes with team members
- **PDF Generation** - Export high-quality PDF resumes
- **Resume Sharing** - Share resumes with secure links
- **Progress Tracking** - Monitor your resume building progress

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

#### Frontend Setup
```bash
cd frontend
npm install
```

#### Backend Setup
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

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
# or
npm start
```

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

## 🏗️ Project Structure

```
cvgenix/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utility functions
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   └── package.json
├── server/                  # Node.js backend API
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── middleware/         # Express middleware
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
└── README.md
```

## 🚀 Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Scripts
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
```

## 🔧 Development

### Adding New Features
1. Create feature branches from `main`
2. Follow the existing code structure
3. Add proper error handling
4. Write tests for new functionality
5. Update documentation

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

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
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend Deployment
1. Set up your production database
2. Configure environment variables
3. Deploy to your preferred hosting platform (Railway, Render, etc.)

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

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Node.js Documentation](https://nodejs.org/docs)

---

**Happy coding! 🎉**