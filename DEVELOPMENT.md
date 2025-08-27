# Resume4Me - Development Guide

## 🚀 **Local Development Workflow**

### **Prerequisites**
- Node.js 18+ installed
- Git installed
- SSH access to server (72.14.179.145)

### **Local Development Setup**

1. **Clone/Setup Project**
   ```bash
   cd "resume4me"
   npm install
   cd server && npm install
   cd ../frontend && npm install
   ```

2. **Environment Configuration**
   - Copy `server/.env.example` to `server/.env`
   - Update MongoDB URI for local development
   - Set JWT_SECRET for local testing

3. **Start Local Development**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start separately:
   npm run server  # Backend on port 5000
   npm run client  # Frontend on port 3000
   ```

### **Development URLs**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

## 🔄 **Deployment Options**

### **Option 1: Quick Sync (Recommended for small changes)**
```bash
./sync.sh
```
- Builds frontend
- Syncs changes to server
- Restarts backend
- **Use for:** CSS changes, small bug fixes, content updates

### **Option 2: Full Deployment (For major changes)**
```bash
./deploy.sh
```
- Complete rebuild and redeploy
- Creates backup of current version
- Fresh installation of dependencies
- **Use for:** New features, dependency updates, major changes

### **Option 3: Manual Sync**
```bash
# Build frontend
cd frontend && npm run build && cd ..

# Upload to server
scp -r frontend/build/* root@72.14.179.145:/var/www/resume-builder/frontend/build/

# Restart server
ssh root@72.14.179.145 "cd /var/www/resume-builder/server && pkill -f 'node index.js' && nohup npm start > server.log 2>&1 &"
```

## 🌐 **Production URLs**
- **Live Site:** https://resume4me.com
- **API Endpoint:** https://resume4me.com/api
- **Health Check:** https://resume4me.com/api/health

## 📁 **Project Structure**
```
resume-builder/
├── frontend/          # React application
│   ├── src/          # Source code
│   ├── public/       # Static files
│   └── build/        # Production build
├── server/           # Node.js backend
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   └── index.js      # Server entry point
├── deploy.sh         # Full deployment script
├── sync.sh          # Quick sync script
└── package.json     # Root package.json
```

## 🔧 **Development Tips**

### **Frontend Development**
- Use `npm start` in frontend directory for hot reload
- Changes to React components auto-refresh
- Check browser console for errors

### **Backend Development**
- Use `npm run dev` in server directory for auto-restart
- Check server logs: `tail -f server/server.log`
- Test API endpoints with Postman or curl

### **Database**
- Local: MongoDB on localhost:27017
- Production: MongoDB on server
- Use MongoDB Compass for database management

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Port already in use**
   ```bash
   lsof -ti:5000 | xargs kill -9  # Kill process on port 5000
   lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
   ```

2. **MongoDB connection failed**
   - Check if MongoDB is running locally
   - Verify connection string in .env file

3. **Build fails**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Deployment fails**
   - Check SSH connection to server
   - Verify server has enough disk space
   - Check server logs: `ssh root@72.14.179.145 "tail -f /var/www/resume-builder/server/server.log"`

### **Server Management**
```bash
# Check server status
ssh root@72.14.179.145 "ps aux | grep node"

# View server logs
ssh root@72.14.179.145 "tail -f /var/www/resume-builder/server/server.log"

# Restart servers
ssh root@72.14.179.145 "cd /var/www/resume-builder/server && pkill -f 'node index.js' && nohup npm start > server.log 2>&1 &"
```

## 📝 **Best Practices**

1. **Always test locally** before deploying
2. **Use quick sync** for small changes
3. **Use full deployment** for major updates
4. **Check server logs** after deployment
5. **Backup before major changes**
6. **Test production site** after deployment

## 🎯 **Workflow Summary**

1. **Develop locally** → Test changes
2. **Commit to Git** → Version control
3. **Run sync script** → Deploy to production
4. **Test live site** → Verify changes
5. **Monitor logs** → Check for issues

Happy coding! 🚀
