import { useState } from 'react'
import { X } from 'lucide-react'
import './CreateCourseModal.css'

export default function CreateCourseModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onSubmit(title.trim())
      setTitle('')
      onClose()
    } catch (err) {
      console.error('Failed to create course:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay animate-fade-in" onClick={handleOverlayClick} id="create-course-modal">
      <div className="modal-content animate-scale-in" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>Create New Course</h2>
          <button className="btn-icon btn-ghost" onClick={onClose} id="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="course-title-input">Course Title</label>
            <input
              id="course-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React Masterclass, AWS Solutions Architect..."
              autoFocus
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim() || loading}
              id="create-course-submit"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
