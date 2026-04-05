import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHealth } from '../api/index.js'

export function Navbar() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadHealth() {
      try {
        const nextHealth = await getHealth()
        if (!isCancelled) {
          setHealth(nextHealth)
          setError(false)
        }
      } catch {
        if (!isCancelled) {
          setError(true)
        }
      }
    }

    loadHealth()

    return () => {
      isCancelled = true
    }
  }, [])

  const metaText = error
    ? 'Backend unavailable'
    : health
      ? `${health.storage.toUpperCase()} active • ${health.s3.enabled ? `S3 ${health.s3.bucket}` : 'local file storage'}`
      : 'Checking backend status…'

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link className="brand" to="/">
          <span className="brand__mark" aria-hidden="true">
            L
          </span>
          <span>
            <span className="brand__title">LearnLog</span>
            <span className="brand__subtitle">Track each course, module, and lesson</span>
          </span>
        </Link>
        <div className={`topbar__meta ${error ? 'topbar__meta--error' : ''}`}>{metaText}</div>
      </div>
    </header>
  )
}
