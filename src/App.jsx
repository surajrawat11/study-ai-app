import { useEffect, useState } from 'react'
import './App.css'

const navItems = [
  'Dashboard',
  'Tasks',
  'Notes',
  'Flashcards',
  'Timetable',
  'Focus Timer',
  'Subjects',
]

const overviewCards = [
  { label: 'Subjects', value: '1', icon: '📘', accent: 'blue', detail: 'Active course' },
  { label: 'Pending Tasks', value: '0', icon: '✅', accent: 'amber', detail: '0 completed' },
  { label: 'Study Time', value: '0m', icon: '⏱️', accent: 'green', detail: 'This week' },
  { label: 'Overdue', value: '0', icon: '⚠️', accent: 'red', detail: 'No blockers' },
]

const subjects = [
  { code: 'D', name: 'Data structure', semester: 'Semester 1' },
  { code: 'A', name: 'Algorithms', semester: 'Semester 1' },
  { code: 'CS', name: 'Computer systems', semester: 'Semester 2' },
]

const timetable = [
  { day: 'Sunday', active: true, classes: 'No classes' },
  { day: 'Monday', classes: 'No classes' },
  { day: 'Tuesday', classes: 'No classes' },
  { day: 'Wednesday', classes: 'No classes' },
  { day: 'Thursday', classes: 'No classes' },
  { day: 'Friday', classes: 'No classes' },
  { day: 'Saturday', classes: 'No classes' },
]

const focusModes = ['Focus', 'Short Break', 'Long Break']

const initialFocusSeconds = 25 * 60

function App() {
  const [activeView, setActiveView] = useState('Dashboard')
  const [focusMode, setFocusMode] = useState('Focus')
  const [secondsLeft, setSecondsLeft] = useState(initialFocusSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)

  useEffect(() => {
    if (!isRunning) return undefined

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setIsRunning(false)
          setCompletedPomodoros((count) => count + 1)
          if (focusMode === 'Focus') {
            setFocusMode('Short Break')
            return 5 * 60
          }
          setFocusMode('Focus')
          return initialFocusSeconds
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isRunning, focusMode])

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setIsRunning((value) => !value)
  }

  const renderContent = () => {
    if (activeView === 'Dashboard') {
      return (
        <>
          <header className="page-header">
            <h1>Welcome back, Student!</h1>
            <p>Today is Sunday, August 23. Let&apos;s make it productive.</p>
          </header>

          <section className="summary-grid">
            {overviewCards.map((card) => (
              <article key={card.label} className={`summary-card ${card.accent}`}>
                <div className="icon-wrap">{card.icon}</div>
                <div className="summary-value">{card.value}</div>
                <div className="summary-label">{card.label}</div>
                <div className="summary-detail">{card.detail}</div>
              </article>
            ))}
          </section>

          <section className="content-row">
            <div className="panel deadlines-panel">
              <div className="panel-header">
                <h2>Upcoming Deadlines</h2>
                <button type="button">View all →</button>
              </div>
              <div className="empty-state large">
                <div className="empty-icon">✓</div>
                <p>No upcoming deadlines. You&apos;re all caught up!</p>
                <button type="button" className="primary-btn">+ Add a task</button>
              </div>
            </div>

            <aside className="panel progress-panel">
              <div className="panel-header">
                <h2>Study Progress</h2>
              </div>
              <div className="progress-metric">
                <span>Tasks completed</span>
                <strong>0/0</strong>
              </div>
              <div className="progress-bar">
                <span style={{ width: '0%' }} />
              </div>
              <p className="progress-text">This week&apos;s study time</p>
              <div className="week-grid">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                  <span key={day + index} className={index === 0 ? 'active' : ''}>{day}</span>
                ))}
              </div>
              <button type="button" className="secondary-btn">▶ Start Focus Session</button>
            </aside>
          </section>
        </>
      )
    }

    if (activeView === 'Tasks') {
      return (
        <>
          <header className="page-header tasks-header">
            <div>
              <h1>Tasks &amp; Assignments</h1>
              <p>Track your assignments, projects, and deadlines</p>
            </div>
            <button type="button" className="primary-btn large">+ New Task</button>
          </header>

          <div className="filters">
            {['All 0', 'Pending 0', 'In Progress 0', 'Completed 0', 'Overdue 0'].map((filter) => (
              <button type="button" key={filter} className={filter.startsWith('All') ? 'active' : ''}>
                {filter}
              </button>
            ))}
          </div>

          <div className="empty-state panel-box">
            <div className="empty-icon">✓</div>
            <p>No tasks here. Create one to get started!</p>
          </div>
        </>
      )
    }

    if (activeView === 'Notes') {
      return (
        <>
          <header className="page-header notes-header">
            <div>
              <h1>Study Notes</h1>
              <p>Organize and review your study materials</p>
            </div>
            <button type="button" className="primary-btn large">+ New Note</button>
          </header>

          <div className="search-row">
            <div className="search-box">🔎 Search notes...</div>
            <div className="filter-select">All subjects ▾</div>
          </div>

          <div className="empty-state panel-box wide">
            <div className="empty-icon paper-icon">📝</div>
            <p>No notes yet. Create your first note!</p>
          </div>
        </>
      )
    }

    if (activeView === 'Flashcards') {
      return (
        <>
          <header className="page-header flash-header">
            <div>
              <h1>Flashcards</h1>
              <p>Create and study flashcards for quick revision</p>
            </div>
            <div className="header-actions">
              <button type="button" className="study-btn">✦ Study</button>
              <button type="button" className="primary-btn large">+ New Card</button>
            </div>
          </header>

          <div className="filters compact-filters">
            {['All (0)', 'Data structure (0)'].map((filter) => (
              <button type="button" key={filter} className={filter.includes('All') ? 'active' : ''}>
                {filter}
              </button>
            ))}
          </div>

          <div className="empty-state panel-box large-box">
            <div className="empty-icon card-icon">▣</div>
            <p>No flashcards yet. Create some to start studying!</p>
          </div>
        </>
      )
    }

    if (activeView === 'Timetable') {
      return (
        <>
          <header className="page-header timetable-header">
            <h1>Weekly Timetable</h1>
            <p>Plan your classes, labs, and study sessions</p>
          </header>

          <div className="timetable-grid">
            {timetable.map((slot) => (
              <div key={slot.day} className={`day-card ${slot.active ? 'active' : ''}`}>
                <div className="day-title-row">
                  <span>{slot.day}</span>
                  {slot.active ? <span className="day-badge">Today</span> : <button type="button">+</button>}
                </div>
                <p>{slot.classes}</p>
              </div>
            ))}
          </div>
        </>
      )
    }

    if (activeView === 'Subjects') {
      return (
        <>
          <header className="page-header subject-header">
            <div>
              <h1>Subjects</h1>
              <p>Manage your courses and subjects</p>
            </div>
            <button type="button" className="primary-btn large">+ Add Subject</button>
          </header>

          <div className="subject-list">
            {subjects.map((subject) => (
              <article key={subject.name} className="subject-card">
                <div className="subject-badge">{subject.code}</div>
                <div>
                  <h3>{subject.name}</h3>
                  <p>{subject.semester}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      )
    }

    return (
      <>
        <header className="page-header focus-header">
          <h1>Focus Timer</h1>
          <p>Use the Pomodoro technique: 25 min focus, 5 min break</p>
        </header>

        <div className="focus-layout">
          <div className="timer-panel">
            <div className="mode-switcher">
              {focusModes.map((mode) => (
                <button
                  type="button"
                  key={mode}
                  className={mode === focusMode ? 'active' : ''}
                  onClick={() => {
                    setFocusMode(mode)
                    setSecondsLeft(mode === 'Focus' ? initialFocusSeconds : mode === 'Short Break' ? 5 * 60 : 15 * 60)
                    setIsRunning(false)
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="timer-ring">
              <div className="timer-core">
                <div className="brain">🧠</div>
                <div className="time-readout">{formatTime(secondsLeft)}</div>
                <div className="timer-label">{focusMode}</div>
              </div>
            </div>

            <div className="timer-actions">
              <button type="button" className="primary-btn large start-btn" onClick={toggleTimer}>
                {isRunning ? '❚❚ Pause' : '▶ Start'}
              </button>
              <button type="button" className="secondary-timer-btn" onClick={() => {
                setIsRunning(false)
                setSecondsLeft(focusMode === 'Focus' ? initialFocusSeconds : focusMode === 'Short Break' ? 5 * 60 : 15 * 60)
              }}>
                ↻
              </button>
            </div>
          </div>

          <aside className="focus-sidebar">
            <div className="side-card">
              <h3>Today&apos;s Progress</h3>
              <div className="progress-ring-wrap">
                <div className="mini-ring">◔</div>
                <div className="mini-value">{completedPomodoros}m</div>
                <div className="mini-label">Total focus time</div>
              </div>
              <div className="mini-bars">
                <span />
                <span />
                <span />
              </div>
              <p>{completedPomodoros} pomodoros completed today</p>
            </div>

            <div className="side-card">
              <h3>Recent Sessions</h3>
              <p>No sessions yet today</p>
            </div>

            <div className="side-card">
              <h3>How it works</h3>
              <ul>
                <li>✓ Focus for 25 minutes on one subject</li>
                <li>✓ Take a short break</li>
                <li>✓ After 4 sessions, take a longer break</li>
              </ul>
            </div>
          </aside>
        </div>
      </>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-icon">🎓</div>
          <div>
            <h2>StudyAI</h2>
            <span>B.Tech Assistant</span>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <button
              type="button"
              key={item}
              className={item === activeView ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveView(item)}
            >
              <span className="nav-icon">
                {item === 'Dashboard' && '▣'}
                {item === 'Tasks' && '✓'}
                {item === 'Notes' && '📝'}
                {item === 'Flashcards' && '▤'}
                {item === 'Timetable' && '🗓️'}
                {item === 'Focus Timer' && '◔'}
                {item === 'Subjects' && '◫'}
              </span>
              {item}
            </button>
          ))}
        </nav>

        <div className="study-tip-card">
          <h3>Study Tip</h3>
          <p>
            Use the Pomodoro timer for 25-minute focused study sessions with 5-minute breaks.
          </p>
        </div>
      </aside>

      <main className="main-panel">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
