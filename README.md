# LearnLog 🔥 – Classroom Edition

**LearnLog** is a decentralized, full-stack course progress tracking and classroom management platform. Designed for both educators and learners, it combines hierarchical content organization with individual progress tracking in a high-performance "Fire & Forge" themed interface.

![LearnLog Theme](https://img.shields.io/badge/Theme-Fire%20%26%20Forge-f59e0b)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20MySQL-blue)

## 🚀 Key Features

### 👨‍🏫 For Teachers (Admins)
- **Classroom Creation**: Instantly create classrooms with unique, auto-generated invite codes.
- **Bulk Folder Uploads**: Preserve nested directory hierarchies when uploading course materials (backed by AWS S3).
- **Student Management**: Review pending join requests, approve or reject students, and manage enrollment.
- **Gradebook & Analytics**: Monitor real-time progress for all students in a classroom. Identify students who need extra support.
- **Content Management**: Rename, delete, and reorganize course nodes on the fly.

### 🎓 For Students (Learners)
- **Seamless Enrollment**: Join any classroom using a 6-digit invite code.
- **Isolated Progress Tracking**: Your completion state is unique to you. Mark lessons as complete and watch your personal progress fire up.
- **Interactive Course Tree**: Navigate complex course structures with a fluid, hierarchical file tree.
- **Milestones & Motivation**: Receive notifications as you hit 25%, 50%, 75%, and 100% completion marks.
- **Responsive Dashboard**: Manage all your learning paths from a single, glassmorphism-inspired interface.

## 🛠️ Tech Stack

- **Frontend**: 
  - **React 19** with **Vite** for blazing-fast development.
  - **React Router DOM** for secure, protected client-side routing.
  - **Lucide React** for a modern, consistent iconography.
  - **Custom CSS Design System** featuring Glassmorphism and "Fire & Forge" aesthetics.
- **Backend**: 
  - **Node.js** with **Express** for a lightweight, scalable API.
  - **JWT (JSON Web Tokens)** for secure, stateless authentication.
  - **MySQL** for robust, relational data management.
  - **Multer** for efficient file handling.
- **Storage**: 
  - **AWS S3** for secure, scalable asset storage.
  - **Pre-signed URLs** for temporary, secure access to private resources.

## 📋 Database Schema

- `users`: Authentication and profile details.
- `classrooms`: Metadata for each learning environment (owner, name, invite code).
- `memberships`: Join relationships with status tracking (pending, approved, rejected).
- `nodes`: Hierarchical tree structure for files and folders within a classroom.
- `user_progress`: Individual lesson completion tracking for students.

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MySQL Server (Port 3306)
- AWS S3 Bucket with programmatic access credentials

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd learnLog

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server/` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=learnlog
JWT_SECRET=your_super_secret_key
AWS_REGION=your_region
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=your_bucket
```

### 4. Running the App
**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
# From project root
npm run dev
```

Visit `http://localhost:5173` to start your journey.

## 🛡️ Security
- **Hashed Passwords**: Bcrypt used for all user credentials.
- **JWT Protection**: All sensitive API routes require a valid token.
- **Role-based Access**: Students cannot modify classroom content or view other students' emails.
- **Private Storage**: Course materials are served via short-lived, pre-signed AWS URLs.

---
*Forged with dedication. Fuelled by ambition. The grind never stops.* 🔥
