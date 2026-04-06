import { ExternalLink, Check } from 'lucide-react'
import './LessonItem.css'

export default function LessonItem({ node, onToggle }) {
  function handleToggle() {
    onToggle(node.id, !node.completed)
  }

  return (
    <div className={`lesson-item ${node.completed ? 'lesson-completed' : ''}`} id={`lesson-${node.id}`}>
      <button
        className={`lesson-checkbox ${node.completed ? 'checked' : ''}`}
        onClick={handleToggle}
        title={node.completed ? 'Mark as incomplete' : 'Mark as complete'}
        id={`lesson-toggle-${node.id}`}
      >
        {node.completed && <Check size={12} strokeWidth={3} />}
      </button>

      {node.resource_url ? (
        <a
          href={node.resource_url}
          target="_blank"
          rel="noopener noreferrer"
          className="lesson-name lesson-name-link"
          onClick={(e) => {
            e.stopPropagation()
            if (!node.completed) {
              onToggle(node.id, true)
            }
          }}
        >
          {node.name}
        </a>
      ) : (
        <span className="lesson-name">{node.name}</span>
      )}

      {node.resource_url && (
        <a
          href={node.resource_url}
          target="_blank"
          rel="noopener noreferrer"
          className="lesson-link"
          title="Open resource"
          onClick={(e) => {
            e.stopPropagation()
            // Auto-mark as completed when the user visits the resource
            if (!node.completed) {
              onToggle(node.id, true)
            }
          }}
        >
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  )
}
