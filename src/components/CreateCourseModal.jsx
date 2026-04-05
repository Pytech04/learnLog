export function CreateCourseModal({ isOpen, onClose, onCreate, isSubmitting }) {
  if (!isOpen) {
    return null
  }

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onCreate(String(formData.get('course-title') || '').trim())
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal__surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-course-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="create-course-title">Create a new course</h2>
        <p>Name the course first. You can upload its folder structure immediately after.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="course-title">Course title</label>
            <input
              id="course-title"
              name="course-title"
              placeholder="Advanced React Systems"
              autoFocus
            />
          </div>

          <div className="modal__actions">
            <button className="ghost-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
