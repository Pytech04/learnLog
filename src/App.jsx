import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { CourseDetailPage } from './pages/CourseDetailPage.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
