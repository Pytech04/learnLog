import { Link } from 'react-router-dom'
import { Trash2, Calendar, FileText } from 'lucide-react'
import ProgressBar from './ProgressBar'
import './CourseCard.css'

export default function CourseCard({ course, onDelete, index = 0 }) {
  const formattedDate = new Date(course.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  function handleDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(`Delete "${course.title}"? This will permanently remove the course and all its files.`)) {
      onDelete(course.id)
    }
  }

  return (
    <Link
      to={`/course/${course.id}`}
      className={`course-card card animate-fade-in-up delay-${Math.min(index + 1, 6)}`}
      id={`course-card-${course.id}`}
    >
      <div className="course-card-header">
        <div className="course-card-title-row">
          <h3 className="course-card-title">{course.title}</h3>
          <button
            className="btn-icon btn-delete-card"
            onClick={handleDelete}
            title="Delete course"
            id={`delete-course-${course.id}`}
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className="course-card-meta">
          <span className="course-card-meta-item">
            <Calendar size={13} />
            {formattedDate}
          </span>
          <span className="course-card-meta-item">
            <FileText size={13} />
            {course.total_lessons || 0} lessons
          </span>
        </div>
      </div>

      <div className="course-card-progress">
        <ProgressBar progress={course.progress || 0} size="sm" />
      </div>

      <div className="course-card-footer">
        <span className="course-card-status">
          {course.completed_lessons || 0} / {course.total_lessons || 0} completed
        </span>
      </div>
    </Link>
  )
}
