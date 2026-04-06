# LearnLog – Classroom Edition Task Tracker

## Phase 1: Foundation (COMPLETED ✅)
- [x] **Project Scoping**: Define decentralized classroom model in `Target.md`.
- [x] **Backend Skeleton**: Express server with JWT middleware and CORS.
- [x] **Database Design**: Schema created for `users`, `classrooms`, `memberships`, `nodes`, and `user_progress`.
- [x] **API Core**: Base routes for Auth, Classrooms, and Folder Uploads.
- [x] **Frontend API Service**: Axios instance with JWT interceptors.

## Phase 2: Authentication & Security (COMPLETED ✅)
- [x] **Secure Storage**: Hashed passwords (bcrypt) in DB.
- [x] **JWT Issuance**: `/api/auth/login` and `/api/auth/register` endpoints.
- [x] **Frontend Auth Flow**:
    - [x] Sign-up / Login pages (Glassmorphism design).
    - [x] Protected Routes in React (Redirect to login if no token).
    - [x] "Logout" functionality (Clearing localStorage).

## Phase 3: Classroom Management (COMPLETED ✅)
- [x] **Admin Features (Teacher)**:
    - [x] "Create Classroom" modal with unique `invite_code` generation.
    - [x] "Admin Dashboard" to view pending join requests.
    - [x] Approve/Reject membership logic in UI.
    - [x] Gradebook view (See all students' progress).
- [x] **Student Features (Learner)**:
    - [x] "Join Classroom" modal for entering invite codes.
    - [x] Progress tracking (Individual isolated checkbox state).
    - [ ] "Pending Approval" state screen in dashboard.

## Phase 4: UI/UX & Refinement (IN PROGRESS 🏗️)
- [x] **Design System**: Apply "Glassmorphism" CSS variables across all components.
- [x] **Animations**: Add transitions for progress bars and checkboxes.
- [x] **Content Viewer**: Hierarchical lesson tree with automatic progress.
- [x] **Milestones**: Milestone notifications at 25%, 50%, 75%, and 100%.
- [ ] **Advanced Features**:
    - [ ] Real-time notifications for join requests.
    - [ ] File previewing for PDFs/Videos within the app.
    - [ ] Course analytics (Time spent, common drop-off points).
