# LearnLog – Implementation Plan

A full-stack course progress tracking system: React (Vite) frontend, Node.js/Express backend, MySQL database, AWS S3 file storage.

## User Review Required

> [!IMPORTANT]
> **MySQL credentials & AWS S3 credentials** are needed at runtime. I'll create a `.env.example` with placeholders. You'll need to fill in your actual MySQL connection details and AWS credentials before running the backend.

> [!IMPORTANT]
> **MySQL must be running** locally (or remotely) before starting the backend. The backend will auto-create the database and tables on first start.

> [!WARNING]
> The existing default Vite+React template files ([App.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/App.jsx), [App.css](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/App.css), [index.css](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/index.css), [main.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/main.jsx)) will be **overwritten** with LearnLog-specific code.

---

## Project Structure

```
learnLog/
├── server/                    # Backend (NEW)
│   ├── package.json
│   ├── .env.example
│   ├── index.js               # Express entry point
│   ├── db/
│   │   ├── connection.js      # MySQL pool
│   │   └── schema.sql         # DDL statements
│   ├── routes/
│   │   ├── courses.js
│   │   ├── nodes.js
│   │   └── upload.js
│   └── services/
│       └── s3.js              # S3 upload helper
├── src/                       # Frontend (MODIFY existing)
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css              # Design system
│   ├── api/
│   │   └── index.js           # Axios service
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── CourseCard.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── FolderTree.jsx
│   │   ├── LessonItem.jsx
│   │   ├── CreateCourseModal.jsx
│   │   └── FolderUpload.jsx
│   └── pages/
│       ├── Dashboard.jsx
│       └── CourseDetail.jsx
├── index.html                 # (MODIFY – update title/meta)
├── package.json               # (MODIFY – add deps)
└── vite.config.js             # (MODIFY – add proxy)
```

---

## Proposed Changes

### Backend Infrastructure

#### [NEW] [server/package.json](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/server/package.json)
Express project with dependencies: `express`, `cors`, `dotenv`, `mysql2`, `multer`, `@aws-sdk/client-s3`, `uuid`.

#### [NEW] [.env.example](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/server/.env.example)
Template with: `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`.

#### [NEW] [index.js](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/server/index.js)
Express server entry point – mounts CORS, JSON parser, routes. Listens on configurable port (default 5000).

---

### Database Layer

#### [NEW] [schema.sql](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/server/db/schema.sql)
```sql
CREATE DATABASE IF NOT EXISTS learnlog;
USE learnlog;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  github_id VARCHAR(255),
  username VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE nodes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('folder','file') NOT NULL,
  parent_id INT DEFAULT NULL,
  resource_url TEXT,
  completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES nodes(id) ON DELETE CASCADE
);
```

#### [NEW] [connection.js](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/server/db/connection.js)
MySQL2 pool with promise wrapper. Auto-initializes database & tables from `schema.sql` on first run.

---

### API Routes

#### [NEW] [courses.js](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/server/routes/courses.js)
- `POST /api/courses` – create course (takes `title`, uses hardcoded `user_id=1` for now)
- `GET /api/courses` – list all courses with progress (computed via SQL aggregate)
- `GET /api/courses/:id` – single course with progress
- `DELETE /api/courses/:id` – cascade delete course + nodes

#### [NEW] [nodes.js](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/server/routes/nodes.js)
- `GET /api/nodes?courseId=` – all nodes for a course
- `PUT /api/nodes/:id` – toggle `completed` field
- `DELETE /api/nodes/:id` – delete a node

#### [NEW] [upload.js](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/server/routes/upload.js)
- `POST /api/upload` – accepts `multipart/form-data` with files + paths array
- For each file: upload to S3 → build folder hierarchy → insert nodes into DB
- Uses multer for multipart parsing
- Hierarchy building: splits `webkitRelativePath` into segments, creates folder nodes as needed (idempotent), creates file node with S3 URL

---

### S3 Service

#### [NEW] [s3.js](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/server/services/s3.js)
- Creates `S3Client` from env vars
- `uploadFile(buffer, key, contentType)` → returns S3 URL
- Key format: `courses/{userId}/{courseName}/{relativePath}`

---

### Frontend – Core

#### [MODIFY] [index.html](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/index.html)
Update `<title>` to "LearnLog" and add meta description + Google Fonts link (Inter).

#### [MODIFY] [package.json](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/package.json)
Add: `react-router-dom`, `axios`, `lucide-react`.

#### [MODIFY] [vite.config.js](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/vite.config.js)
Add proxy: `/api` → `http://localhost:5000`.

#### [MODIFY] [index.css](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/index.css)
Complete design system: CSS variables (dark theme with accent colors), base resets, typography, utility classes, animations.

#### [MODIFY] [main.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/main.jsx)
Wrap `<App />` with `<BrowserRouter>`.

#### [MODIFY] [App.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/App.jsx)
Routes: `/` → Dashboard, `/course/:id` → CourseDetail. Include `<Navbar>`.

---

### Frontend – Components

#### [NEW] [api/index.js](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/api/index.js)
Axios instance with base URL `/api`. Functions: `getCourses`, `createCourse`, `deleteCourse`, `getCourse`, `getNodes`, `updateNode`, `uploadFolder`.

#### [NEW] [Navbar.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/components/Navbar.jsx)
Top navigation bar with logo and branding.

#### [NEW] [CourseCard.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/components/CourseCard.jsx)
Card with course title, creation date, progress bar, delete button.

#### [NEW] [ProgressBar.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/components/ProgressBar.jsx)
Animated progress bar with percentage label.

#### [NEW] [FolderTree.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/components/FolderTree.jsx)
Recursive component rendering folder/file hierarchy. Folders expand/collapse. Files are `LessonItem`s.

#### [NEW] [LessonItem.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/components/LessonItem.jsx)
Single lesson row: checkbox (completed toggle), file name, link to resource.

#### [NEW] [CreateCourseModal.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/components/CreateCourseModal.jsx)
Modal with form input for course title.

#### [NEW] [FolderUpload.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/components/FolderUpload.jsx)
Uses `<input webkitdirectory multiple />`. Collects files + relative paths + sends via FormData to `/api/upload`.

---

### Frontend – Pages

#### [NEW] [Dashboard.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/pages/Dashboard.jsx)
Lists courses as cards grid. "New Course" button opens modal. Each card links to detail page.

#### [NEW] [CourseDetail.jsx](file:///c:/Users/Kshitij%20Sharma/Desktop/Omnis/Dominion/Project/AWDT/learnLog/src/pages/CourseDetail.jsx)
Course header with progress bar, folder upload section, tree view of all nodes.

---

## Design Approach

- **Dark theme** with rich gradients (deep navy → charcoal background)
- **Accent**: Vibrant blue-violet gradient for interactive elements
- **Typography**: Inter from Google Fonts
- **Cards**: Glassmorphism with subtle backdrop blur
- **Micro-animations**: Hover lifts, smooth transitions on progress bar updates, fade-in on mount
- **Responsive**: CSS Grid for dashboard, flex layouts for detail page

---

## Verification Plan

### Automated Checks
1. **Backend starts**: `cd server && node index.js` – should log "Server running on port 5000" with no errors
2. **Frontend builds**: `cd learnLog && npm run build` – should compile with zero errors
3. **Frontend dev server**: `npm run dev` – should serve on localhost

### Browser Verification
I will use the browser tool to:
1. Navigate to `http://localhost:5173` and verify the Dashboard renders
2. Create a new course via the modal and verify it appears
3. Navigate into a course detail page and verify the tree view renders
4. Take screenshots of the UI for visual verification

### Manual Verification (User)
> [!NOTE]
> Since S3 and MySQL require real credentials, full end-to-end upload testing requires:
> 1. Running MySQL locally and filling in `.env` credentials
> 2. Providing AWS S3 credentials in `.env`
> 3. Uploading a test course folder and verifying files appear in S3 and the tree renders
>
> I'll build the complete code and verify everything compiles/renders. You can test the full flow once credentials are configured.
