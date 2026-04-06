import './ProgressBar.css'

export default function ProgressBar({ progress = 0, size = 'md', showLabel = true }) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className={`progress-bar-wrapper progress-bar-${size}`}>
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${clampedProgress === 100 ? 'progress-complete' : ''}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className={`progress-bar-label ${clampedProgress === 100 ? 'label-complete' : ''}`}>
          {clampedProgress}%
        </span>
      )}
    </div>
  )
}
