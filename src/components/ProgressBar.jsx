export function ProgressBar({
  value,
  label = 'Progress',
  completedLessons = 0,
  totalLessons = 0,
}) {
  const normalizedValue = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className="progress" aria-label={label}>
      <div className="progress__meta">
        <span>{label}</span>
        <span>
          {completedLessons}/{totalLessons} lessons
        </span>
      </div>
      <div className="progress__track" aria-hidden="true">
        <div className="progress__fill" style={{ width: `${normalizedValue}%` }} />
      </div>
      <div className="progress__meta">
        <span>{normalizedValue}% complete</span>
        <span>{totalLessons === 0 ? 'Upload lessons to start' : 'Keep going'}</span>
      </div>
    </div>
  )
}
