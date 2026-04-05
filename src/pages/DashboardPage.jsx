import { useEffect, useState } from 'react'
import { createCourse, deleteCourse, getCourses } from '../api/index.js'
import { CourseCard } from '../components/CourseCard.jsx'
import { CreateCourseModal } from '../components/CreateCourseModal.jsx'

export function DashboardPage() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  async function loadCourses() {
    setIsLoading(true)
    try {
      const nextCourses = await getCourses()
      setCourses(nextCourses)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Failed to load courses.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  async function handleCreate(title) {
    if (!title) {
      return
    }

    setIsSubmitting(true)
    try {
      const course = await createCourse({ title })
      setCourses((current) => [course, ...current])
      setIsModalOpen(false)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Failed to create the course.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(course) {
    setDeletingId(course.id)
    try {
      await deleteCourse(course.id)
      setCourses((current) => current.filter((item) => item.id !== course.id))
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Failed to delete the course.')
    } finally {
      setDeletingId(null)
    }
  }

  const totalLessons = courses.reduce((sum, course) => sum + Number(course.total_lessons || 0), 0)
  const completedLessons = courses.reduce(
    (sum, course) => sum + Number(course.completed_lessons || 0),
    0,
  )

  return (
    <>
      <section className="page-head">
        <div className="hero-card">
          <div className="hero-card__content">
            <span className="eyebrow">Focused study system</span>
            <h1>See every course as a living progress map.</h1>
            <p>
              Build a clean catalog of your courses, upload their folder structures, and track
              lesson completion without leaving the browser.
            </p>
            <div className="hero-card__actions">
              <button className="button" type="button" onClick={() => setIsModalOpen(true)}>
                Create a course
              </button>
              <button className="ghost-button" type="button" onClick={loadCourses}>
                Refresh data
              </button>
            </div>
          </div>
        </div>

        <div className="stat-stack">
          <article className="stat-card">
            <span className="stat-card__label">Courses</span>
            <strong className="stat-card__value">{courses.length}</strong>
            <div className="stat-card__hint">A single place for all active learning tracks.</div>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Lesson completion</span>
            <strong className="stat-card__value">
              {completedLessons}/{totalLessons}
            </strong>
            <div className="stat-card__hint">Progress updates are saved instantly.</div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <h2>Your study library</h2>
            <p>Open a course to upload content, inspect the folder tree, and mark lessons complete.</p>
          </div>
        </div>

        <div className="panel">
          {error ? <div className="error-line">{error}</div> : null}
          {isLoading ? (
            <div className="loading-block">Loading courses…</div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <h3>No courses yet</h3>
              <p>Create your first course and start turning a file dump into a trackable roadmap.</p>
            </div>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onDelete={handleDelete}
                  isDeleting={deletingId === course.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
