import { useState, useEffect } from 'react'
import { Plus, KeyRound, Flame, Loader2, Target } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ClassroomCard from '../components/ClassroomCard'
import CreateClassroomModal from '../components/CreateClassroomModal'
import JoinClassroomModal from '../components/JoinClassroomModal'
import { getClassrooms, createClassroom, deleteClassroom, joinClassroom } from '../api'
import './Dashboard.css'

const QUOTES = [
  "The grind doesn't stop. Neither do you.",
  "Discipline is choosing between what you want now and what you want most.",
  "Every lesson completed is a brick in your empire.",
  "Hard work beats talent when talent doesn't work hard.",
  "Success is built one lesson at a time.",
]

export default function Dashboard() {
  const { user } = useAuth()
  const [teaching, setTeaching] = useState([])
  const [learning, setLearning] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length]

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const data = await getClassrooms()
      setTeaching(data.teaching || [])
      setLearning(data.learning || [])
    } catch (err) {
      console.error('Failed to load classrooms:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(name, description) {
    await createClassroom(name, description)
    await loadData()
  }

  async function handleJoin(code) {
    const result = await joinClassroom(code)
    await loadData()
    return result
  }

  async function handleDelete(id) {
    try {
      await deleteClassroom(id)
      setTeaching((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  if (loading) {
    return (
      <main className="page" id="dashboard-page">
        <div className="container">
          <div className="dashboard-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading your world...</p>
          </div>
        </div>
      </main>
    )
  }

  const isEmpty = teaching.length === 0 && learning.length === 0

  return (
    <main className="page" id="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header animate-fade-in-up">
          <div className="dashboard-header-text">
            <h1 className="dashboard-title">
              <Flame size={30} className="title-flame" />
              Hey, {user?.username || 'Warrior'}
            </h1>
            <p className="dashboard-quote">"{quote}"</p>
          </div>

          <div className="dashboard-actions">
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)} id="create-classroom-btn">
              <Plus size={16} /> Create
            </button>
            <button className="btn btn-secondary" onClick={() => setJoinOpen(true)} id="join-classroom-btn">
              <KeyRound size={16} /> Join
            </button>
          </div>
        </div>

        {isEmpty ? (
          <div className="empty-state animate-fade-in-up delay-2">
            <div className="empty-icon"><Target size={48} /></div>
            <h2>The journey starts now</h2>
            <p>Create a classroom to teach, or join one to learn.</p>
            <div className="empty-actions">
              <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
                <Plus size={16} /> Create Classroom
              </button>
              <button className="btn btn-secondary" onClick={() => setJoinOpen(true)}>
                <KeyRound size={16} /> Join Classroom
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Teaching Section */}
            {teaching.length > 0 && (
              <section className="dashboard-section animate-fade-in-up delay-1" id="teaching-section">
                <h2 className="section-heading">🔥 Teaching</h2>
                <div className="classroom-grid">
                  {teaching.map((c, i) => (
                    <ClassroomCard key={c.id} classroom={c} variant="teaching" onDelete={handleDelete} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Learning Section */}
            {learning.length > 0 && (
              <section className="dashboard-section animate-fade-in-up delay-2" id="learning-section">
                <h2 className="section-heading">📖 Learning</h2>
                <div className="classroom-grid">
                  {learning.map((c, i) => (
                    <ClassroomCard key={c.id} classroom={c} variant="learning" index={i} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <CreateClassroomModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
        <JoinClassroomModal isOpen={joinOpen} onClose={() => setJoinOpen(false)} onSubmit={handleJoin} />
      </div>
    </main>
  )
}
