# LearnLog – Full-Stack Course Progress Tracker

## Planning
- [x] Create implementation plan
- [x] Get user approval on plan

## Backend Setup
- [x] Initialize Node.js + Express backend (`server/`)
- [x] Install backend dependencies (express, mysql2, multer, @aws-sdk/client-s3, cors, dotenv)
- [x] Create `.env.example` with required environment variables
- [x] Create database schema SQL file

## Database Layer
- [x] Create MySQL connection module
- [x] Create `users` table
- [x] Create `courses` table
- [x] Create `nodes` table (self-referencing hierarchy)

## Backend API Routes
- [x] POST /api/courses – create course
- [x] GET /api/courses – list courses
- [x] GET /api/courses/:id – get course details
- [x] DELETE /api/courses/:id – delete course
- [x] GET /api/nodes?courseId= – get nodes for a course
- [x] PUT /api/nodes/:id – update completion status
- [x] DELETE /api/nodes/:id – delete node
- [x] POST /api/upload – handle folder upload (S3 + DB)

## S3 Integration
- [x] Configure AWS S3 client
- [x] Implement file upload with relative path as key
- [x] Return S3 URL for storage in DB

## Frontend – Design System & Layout
- [ ] Install frontend deps (react-router-dom, axios, lucide-react)
- [ ] Create global CSS design system (index.css)
- [ ] Create app layout with navigation
- [ ] Set up React Router

## Frontend – Dashboard Page
- [ ] CourseCard component
- [ ] ProgressBar component
- [ ] Create Course modal/form
- [ ] Dashboard page with course listing

## Frontend – Course Detail Page
- [ ] FolderTree recursive component
- [ ] LessonItem component with completion toggle
- [ ] Folder upload UI
- [ ] Course detail page assembly

## Frontend – API Integration
- [ ] API service module (axios)
- [ ] Connect Dashboard to backend
- [ ] Connect Course Detail to backend
- [ ] Connect upload flow to backend

## Verification
- [ ] Backend starts without errors
- [ ] Frontend builds and renders correctly
- [ ] API endpoints respond correctly (browser testing)
- [ ] UI visual verification (screenshots)
