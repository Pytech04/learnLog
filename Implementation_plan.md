# LearnLog – Implementation Plan (Classroom Edition)

## Project Overview
LearnLog is a multi-tenant classroom platform where any user can be a Teacher (Admin) or a Student (Learner). It provides hierarchical course organization, S3-backed content delivery, and individual progress tracking.

---

## Architecture Plan (COMPLETED ✅)

### 1. Database Schema
- **`users`**: Secure credentials (bcrypt).
- **`classrooms`**: Teacher-owned, accessible via `invite_code`.
- **`memberships`**: Relationship between `user_id` and `classroom_id` (pending/approved/rejected).
- **`nodes`**: Tree structure for course content.
- **`user_progress`**: Isolated completion state per (user_id, node_id).

### 2. Backend Security & Auth
- **JWT Strategy**: Secure authentication for all routes.
- **Middleware**:
    - `authMiddleware`: Verifies valid JWT.
    - `ownershipMiddleware`: (Implicit in routes) Verifies permission for management tasks.

### 3. Frontend Architecture
- **Global State**: `AuthContext` manages session.
- **Routing**: Protected and Public route wrappers.
- **Workspace Layouts**:
    - `AdminWorkspace`: For content management and student tracking.
    - `StudentWorkspace`: For course consumption and personal progress.

---

## Design System: Fire & Forge (COMPLETED ✅)
- **Glassmorphism**: Translucent cards with `backdrop-filter: blur(12px)`.
- **Theme**: Deep Charcoal (`#0a0a0f`) with Amber/Gold (`#f59e0b`) accents.
- **Typography**: Inter (Sans-serif) for professional clarity.
- **Animations**: Fluid scale and fade transitions for a premium feel.

---

## Current Status

### Phase 1: Authentication & User Management (✅ COMPLETED)
- User registration and login with JWT.
- Secure password hashing with bcrypt.
- Frontend Auth flow with protected routes.

### Phase 2: Classroom Lifecycle (✅ COMPLETED)
- Creation of classrooms with auto-generated invite codes.
- Joining classrooms via invite code with approval request.
- Membership management (Approve/Reject) for Teachers.

### Phase 3: Content & Progress (✅ COMPLETED)
- Bulk folder upload preserving directory hierarchy (AWS S3).
- Individual progress tracking (independent for each student).
- Admin "Gradebook" to monitor student advancement.

---

## Remaining Implementation Steps

### Step 1: UI Polish & Feedback
- [ ] Add a visual "Pending" section in the student dashboard for classrooms awaiting approval.
- [ ] Implement a more robust "Immersive Mode" for the content player.

### Step 2: Advanced Content Handling
- [ ] Direct file preview for common formats (PDF, Video, Images).
- [ ] Support for external resource links (YouTube, Docs).

### Step 3: Social & Notifications
- [ ] Email notifications for join requests and approvals.
- [ ] Classroom "Announcements" board.
