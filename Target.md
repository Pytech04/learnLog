# Target.md - LearnLog: Decentralized Classroom Platform

## Problem Statement
The current **LearnLog** application is a single-user tool where progress is global. To scale, we need a "Multi-Tenant" model where the platform acts as a host for many independent "Classrooms." 

## Project Vision: The Decentralized Classroom
Instead of a fixed Admin/User hierarchy, LearnLog will allow **any registered user** to create their own learning environment. 
- **User as Creator**: Any user can click "Create Classroom," upload a course, and become the **Admin/Teacher** of that specific space.
- **User as Learner**: Users can join classrooms created by others (via a Join Code or Invite) and become **Students** in that space.
- **Contextual Roles**: A single user can be a Teacher in one classroom and a Student in three others simultaneously.

---

## 1. Authentication & User Management (Local Auth)
We will implement a direct, secure local authentication system (No third-party KYC required).
- **Registration**: Users sign up with `Email`, `Username`, and `Password`.
- **Login**: Secure `Email/Password` login issuing a JWT for stateless verification.
- **User Profile**: A central hub to manage "My Classrooms" (Teaching) and "Enrolled" (Learning).

---

## 2. The Joining Workflow (Permission-Based)
Admins have full control over who enters their classroom to ensure a private learning environment.
1. **Invite Code**: Every classroom generates a unique 6-character `Join Code` (e.g., `XJ92LF`).
2. **Join Request**: A student enters the code. Their membership status is initially set to `PENDING`.
3. **Admin Approval**: The Admin sees a "Pending Requests" badge on their dashboard. They must "Approve" the student before the student can see any content.
4. **Access Control**: Only `APPROVED` students can view lesson nodes and track individual progress.

---

## 3. UI/UX Design Goals (Glassmorphism Aesthetic)
The UI will feature a modern, dark-themed "Glassmorphism" look with vibrant accents.

### A. The Unified Dashboard
- **"Teaching" Grid**: Cards for classrooms you own. Each card displays a "Pending Requests" count and a "Manage" button.
- **"Learning" Grid**: Cards for classrooms you've joined. Each card shows your personal **Progress Bar** (e.g., "60% Completed").
- **Floating Action Bar**: Prominent "Create" and "Join" buttons for quick navigation.

### B. Admin Workspace (The Teacher's Lounge)
- **Student Analytics**: A "Gradebook" view showing a list of all approved students and their individual completion percentages.
- **Invite Hub**: A clear area to view and "Copy Join Code" or "Copy Invite Link" to the clipboard.
- **Approval Queue**: A dedicated tab to Approve/Reject pending join requests.

### C. Student Workspace (The Study Hall)
- **Immersive Content Viewer**: A clean, sidebar-driven interface for navigating lessons with a large main area for videos, PDFs, or text.
- **Gamified Progress**: Animated checkboxes and "Milestone" notifications when a student reaches 25%, 50%, 75%, and 100% completion.

---

## 4. Database Schema Refactoring

1.  **`users` Table**: `id`, `username`, `email`, `password_hash`, `created_at`.
2.  **`classrooms` Table** (formerly `courses`): 
    *   `id` (PK)
    *   `name`, `description`, `owner_id` (FK to `users`), `invite_code` (Unique).
3.  **`memberships` Table**: 
    *   `user_id` (FK to `users`)
    *   `classroom_id` (FK to `classrooms`)
    *   `role` ('teacher', 'student')
    *   **`status`**: ENUM('pending', 'approved', 'rejected').
4.  **`nodes` Table**: Content hierarchy linked to a `classroom_id`.
5.  **`user_progress` Table**: 
    *   `user_id`, `node_id`, `completed` (Boolean), `updated_at`.

---

## 5. Security & Scalability
- **Password Protection**: Use `bcrypt` with a salt factor of 10.
- **Contextual Auth**: Backend middleware verifies if `current_user` is the `owner` of a classroom before allowing any `POST/PUT/DELETE` on its content.
- **Data Isolation**: A student's progress is strictly tied to their `user_id` and cannot be viewed by other students.
