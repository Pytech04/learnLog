import { useState } from 'react'
import { X } from 'lucide-react'
import './CreateClassroomModal.css'

export default function CreateClassroomModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await onSubmit(name.trim(), description.trim())
      setName('')
      setDescription('')
      onClose()
    } catch (err) {
      console.error('Failed to create classroom:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay animate-fade-in" onClick={handleOverlayClick} id="create-classroom-modal">
      <div className="modal-content animate-scale-in" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>Create Classroom</h2>
          <button className="btn-icon btn-ghost" onClick={onClose} id="modal-close-btn">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="classroom-name-input">Classroom Name</label>
            <input
              id="classroom-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React Masterclass, AWS Security..."
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="classroom-desc-input">Description (optional)</label>
            <textarea
              id="classroom-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn?"
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim() || loading} id="create-classroom-submit">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
