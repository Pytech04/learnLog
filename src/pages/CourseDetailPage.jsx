import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteNode,
  getCourse,
  getNodes,
  updateNode,
  uploadFolder,
} from '../api/index.js'
import { FolderTree } from '../components/FolderTree.jsx'
import { FolderUpload } from '../components/FolderUpload.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [nodes, setNodes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingNode, setIsSavingNode] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadCourse() {
      setIsLoading(true)
      try {
        const [nextCourse, nextNodes] = await Promise.all([getCourse(courseId), getNodes(courseId)])
        if (isCancelled) {
          return
        }
        setCourse(nextCourse)
        setNodes(nextNodes)
        setError('')
      } catch (requestError) {
        if (isCancelled) {
          return
        }
        const message = requestError.response?.data?.error || 'Failed to load the course.'
        setError(message)
        if (requestError.response?.status === 404) {
          setTimeout(() => navigate('/'), 900)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadCourse()

    return () => {
      isCancelled = true
    }
  }, [courseId, navigate])

  async function refreshCourse() {
    const [nextCourse, nextNodes] = await Promise.all([getCourse(courseId), getNodes(courseId)])
    setCourse(nextCourse)
    setNodes(nextNodes)
  }

  async function handleUpload(selectedCourseId, files) {
    setIsUploading(true)
    try {
      const response = await uploadFolder(selectedCourseId, files)
      await refreshCourse()
      setStatus(`${response.message} Stored via ${response.storage}.`)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleToggle(node, completed) {
    setIsSavingNode(true)
    try {
      await updateNode(node.id, { completed })
      await refreshCourse()
      setStatus(`Updated ${node.name}.`)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Failed to update lesson progress.')
    } finally {
      setIsSavingNode(false)
    }
  }

  async function handleDelete(node) {
    setIsSavingNode(true)
    try {
      await deleteNode(node.id)
      await refreshCourse()
      setStatus(`Removed ${node.name}.`)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Failed to delete item.')
    } finally {
      setIsSavingNode(false)
    }
  }

  if (isLoading) {
    return <div className="loading-block">Loading course workspace…</div>
  }

  if (!course) {
    return <div className="error-line">{error || 'Course not found.'}</div>
  }

  return (
    <>
      <div className="detail-head">
        <div>
          <Link className="ghost-button" to="/">
            Back to dashboard
          </Link>
          <h1>{course.title}</h1>
          <p>Track modules and lessons from a real folder tree, not a flat checklist.</p>
          <div className="detail-meta">
            <span className="chip">Created {formatDate(course.created_at)}</span>
            <span className="chip">{course.total_lessons} lessons detected</span>
            <span className="chip">{course.completed_lessons} lessons completed</span>
          </div>
        </div>
        <div className="detail-head__actions">
          <button className="ghost-button" type="button" onClick={refreshCourse}>
            Refresh
          </button>
        </div>
      </div>

      <div className="detail-layout">
        <div className="tree-card">
          <div className="tree-card__head">
            <div>
              <h2>Course structure</h2>
              <p>Folders expand recursively and each lesson can be completed or removed.</p>
            </div>
          </div>

          <ProgressBar
            value={course.progress}
            completedLessons={course.completed_lessons}
            totalLessons={course.total_lessons}
          />

          {status ? <div className="status-line">{status}</div> : null}
          {error ? <div className="error-line">{error}</div> : null}

          <FolderTree
            nodes={nodes}
            onToggle={handleToggle}
            onDelete={handleDelete}
            isSaving={isSavingNode}
          />
        </div>

        <FolderUpload courseId={course.id} onUpload={handleUpload} isUploading={isUploading} />
      </div>
    </>
  )
}
