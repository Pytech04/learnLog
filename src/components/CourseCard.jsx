import { Link } from 'react-router-dom'
import { ProgressBar } from './ProgressBar.jsx'

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function CourseCard({ course, onDelete, isDeleting }) {
  return (
    <article className="course-card">
      <div className="course-card__header">
        <Link className="course-card__title" to={`/courses/${course.id}`}>
          <h3>{course.title}</h3>
          <p>Created {formatDate(course.created_at)}</p>
        </Link>
        <button
          className="danger-button"
          type="button"
          onClick={() => onDelete(course)}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
      <ProgressBar
        value={course.progress}
        completedLessons={course.completed_lessons}
        totalLessons={course.total_lessons}
      />
      <div className="course-card__meta">
        {course.total_lessons === 0
          ? 'No lessons uploaded yet'
          : `${course.completed_lessons} of ${course.total_lessons} lessons completed`}
      </div>
    </article>
  )
}
