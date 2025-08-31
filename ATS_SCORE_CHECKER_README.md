# ATS Score Checker - Resume Analysis System

## Overview

The ATS Score Checker is a comprehensive resume analysis tool that evaluates resumes for Applicant Tracking System (ATS) compatibility. It provides detailed feedback on resume optimization and helps users improve their chances of passing automated screenings.

## Features

### 🎯 **Core Functionality**
- **File Upload Support**: Accepts PDF, DOC, and DOCX files
- **Real-time Analysis**: Instant ATS compatibility scoring
- **Detailed Feedback**: Comprehensive analysis with actionable suggestions
- **Keyword Analysis**: Identifies relevant keywords and their categories
- **Score Breakdown**: Detailed scoring across multiple criteria

### 📊 **Analysis Components**

#### 1. **Keyword Analysis (30% of total score)**
- Technical skills detection
- Soft skills identification
- Action verbs analysis
- Industry-specific keyword matching

#### 2. **Formatting Analysis (25% of total score)**
- Document structure evaluation
- Contact information verification
- Section header detection
- Bullet point usage analysis

#### 3. **Structure Analysis (25% of total score)**
- Required section identification
- Content distribution assessment
- Professional layout evaluation

#### 4. **Content Quality Analysis (20% of total score)**
- Action verb usage
- Quantifiable achievements detection
- Professional language assessment

### 🔧 **Technical Implementation**

#### Backend API (`server/routes/ats.js`)
```javascript
// Main analysis endpoint
POST /api/ats/analyze
- Accepts: PDF, DOC, DOCX files
- Returns: ATS score and detailed analysis

// Keyword suggestions
GET /api/ats/keywords
- Returns: Industry-specific keyword recommendations

// Analysis history (authenticated users)
GET /api/ats/history
POST /api/ats/save-analysis
```

#### Frontend Integration (`frontend/src/pages/ATSScorePage.jsx`)
- Modern React component with drag-and-drop file upload
- Real-time analysis with loading states
- Comprehensive results display
- Error handling and user feedback

#### API Service (`frontend/src/services/atsService.js`)
- Centralized API communication
- Authentication handling
- Error management
- File upload processing

## API Endpoints

### 1. **Analyze Resume**
```http
POST /api/ats/analyze
Content-Type: multipart/form-data

Body:
- resume: File (PDF, DOC, DOCX)
- jobTitle: String (optional)
- industry: String (optional)

Response:
{
  "success": true,
  "data": {
    "score": 85,
    "analysis": {
      "strengths": [...],
      "improvements": [...],
      "suggestions": [...],
      "keywordMatches": {...},
      "detailedScores": {...}
    }
  }
}
```

### 2. **Get Keywords**
```http
GET /api/ats/keywords?jobTitle=Software Engineer&industry=Technology

Response:
{
  "success": true,
  "data": {
    "keywords": {
      "technical": [...],
      "softSkills": [...],
      "actionVerbs": [...]
    }
  }
}
```

### 3. **Save Analysis (Authenticated)**
```http
POST /api/ats/save-analysis
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "score": 85,
  "analysis": {...},
  "jobTitle": "Software Engineer",
  "industry": "Technology"
}
```

## File Processing

### Supported Formats
- **PDF**: Uses `pdf-parse` library for text extraction
- **DOCX**: Uses `mammoth` library for text extraction
- **DOC**: Fallback processing (conversion recommended)

### File Validation
- Maximum file size: 10MB
- File type validation
- Automatic cleanup after processing

## Scoring Algorithm

### Score Ranges
- **90-100**: Excellent - Well-optimized for ATS
- **80-89**: Good - Solid compatibility with room for improvement
- **70-79**: Fair - Needs optimization
- **60-69**: Needs Improvement - Significant optimization required

### Detailed Scoring
1. **Keyword Score**: Based on relevant keyword matches
2. **Formatting Score**: Document structure and layout
3. **Structure Score**: Section completeness and organization
4. **Content Score**: Quality of content and achievements

## User Interface Features

### Upload Section
- Drag-and-drop file upload
- File type validation
- Progress indicators
- Error handling

### Results Display
- Visual score representation
- Detailed breakdown charts
- Keyword analysis visualization
- Actionable improvement suggestions

### Additional Features
- Job title and industry input (optional)
- Download analysis report
- Link to resume builder
- Responsive design

## Installation & Setup

### Backend Dependencies
```bash
cd server
npm install
```

Required packages:
- `pdf-parse`: PDF text extraction
- `mammoth`: DOCX text extraction
- `multer`: File upload handling
- `express-validator`: Input validation

### Frontend Dependencies
```bash
cd frontend
npm install
```

### Environment Variables
```env
# Backend (.env)
PORT=3001
FRONTEND_URL=http://localhost:3000

# Frontend (.env)
REACT_APP_API_URL=http://localhost:3001/api
```

## Usage

1. **Navigate to ATS Score Checker**
   - Click "ATS Score" in the navigation menu
   - Or visit `/ats-score` directly

2. **Upload Resume**
   - Drag and drop a PDF, DOC, or DOCX file
   - Or click "Choose File" to browse
   - Optionally enter job title and industry

3. **Analyze Resume**
   - Click "Analyze Resume" button
   - Wait for processing (typically 3-5 seconds)

4. **Review Results**
   - View your ATS compatibility score
   - Examine detailed breakdown
   - Review strengths and areas for improvement
   - Check keyword analysis

5. **Take Action**
   - Download analysis report
   - Build a new optimized resume
   - Apply suggested improvements

## Error Handling

### Common Issues
- **File too large**: Maximum 10MB limit
- **Invalid file type**: Only PDF, DOC, DOCX supported
- **Processing error**: Retry with a different file
- **Network error**: Check internet connection

### Error Messages
- Clear, user-friendly error messages
- Specific guidance for resolution
- Fallback options when available

## Security Features

### File Processing
- Temporary file storage
- Automatic cleanup after processing
- No permanent file storage
- Secure file validation

### Authentication
- Optional user authentication
- Secure token-based API access
- Analysis history for authenticated users

## Performance Optimization

### Backend
- Efficient text extraction
- Optimized scoring algorithms
- File size limits
- Memory management

### Frontend
- Lazy loading of components
- Efficient state management
- Optimized file handling
- Responsive design

## Future Enhancements

### Planned Features
- **Database Integration**: Store analysis history
- **Advanced Text Processing**: Better DOC file support
- **Industry-Specific Scoring**: Tailored algorithms
- **Bulk Analysis**: Multiple resume processing
- **Export Options**: PDF reports, CSV data
- **Integration**: Resume builder integration

### Technical Improvements
- **Real-time Processing**: WebSocket-based updates
- **Caching**: Analysis result caching
- **Machine Learning**: Improved keyword detection
- **API Rate Limiting**: Enhanced security

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up environment variables
4. Start development servers
5. Test with sample resume files

### Testing
- Unit tests for scoring algorithms
- Integration tests for API endpoints
- UI tests for user interactions
- File upload testing

## Support

For issues or questions:
1. Check the error handling section
2. Review the API documentation
3. Test with different file formats
4. Verify environment setup

---

**Note**: This ATS Score Checker provides analysis based on common ATS system requirements. Results may vary depending on specific ATS systems used by employers.
