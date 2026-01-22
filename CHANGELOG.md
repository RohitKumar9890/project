# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-22

### Added
- Initial release of EduEval platform
- User authentication with JWT
- Role-based access control (Admin, Faculty, Student)
- Exam creation and management
- Real-time code execution with Docker
- Material upload and management
- Progress tracking for students
- Announcement system
- Excel import/export functionality
- Email notifications
- Comprehensive API documentation
- Docker support for development
- Monorepo structure with workspaces

### Features by Role

#### Admin
- User management (create, edit, delete users)
- Semester management
- Subject management
- Section management
- Bulk user import from Excel
- Data export capabilities

#### Faculty
- Create and manage exams
- Multiple question types (MCQ, coding, essay)
- Upload course materials
- Grade student submissions
- Create announcements
- View exam statistics
- Manage enrolled students

#### Student
- Join exams using exam codes
- Take exams with timer
- Submit code for evaluation
- View course materials
- Track progress and grades
- Receive announcements

### Security
- Password hashing with bcrypt
- JWT token authentication
- Refresh token rotation
- Rate limiting on API endpoints
- Input validation
- CORS protection
- Helmet security headers

### Infrastructure
- Next.js 14 frontend
- Express.js backend
- Firebase Firestore database
- Docker for code execution
- PM2 process management support
- Nginx reverse proxy configuration

## [Unreleased]

### Planned Features
- OAuth integration (Google, Microsoft)
- Real-time notifications with WebSocket
- Advanced analytics dashboard
- Mobile responsive improvements
- Offline support
- Redis caching layer
- Multi-language support
- Video conferencing integration
- Assignment submission system
- Plagiarism detection
- Quiz builder with question bank
- Certificate generation
- Parent/Guardian portal

---

For more details on each release, see the [GitHub Releases](https://github.com/yourusername/edueval/releases) page.
