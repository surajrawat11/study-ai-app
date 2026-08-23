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
  'AI Assistant',
]

const focusModes = ['Focus', 'Short Break', 'Long Break']

const initialFocusSeconds = 25 * 60
const storageKey = 'study-ai-data'
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
const defaultSubjects = [
  ['DS', 'Data structure', 'Semester 1'],
  ['DAA', 'Design and Analysis of Algorithm', 'Semester 1'],
  ['WT', 'Web Technology', 'Semester 1'],
  ['DBMS', 'Database Management System', 'Semester 1'],
  ['MR', 'Mechanics of Robotics', 'Semester 1'],
  ['DEC', 'Data Encryption and Compression', 'Semester 1'],
  ['CC', 'Cloud Computing', 'Semester 1'],
  ['AI', 'Artificial Intelligence', 'Semester 1'],
  ['DA', 'Data Analytics', 'Semester 1'],
  ['DWM', 'Data Warehousing & Data Mining', 'Semester 1'],
  ['COI', 'Constitution of India', 'Semester 1'],
  ['DAA LAB', 'Design and Analysis of Algorithm Lab', 'Semester 1'],
  ['WT LAB', 'Web Technology Lab', 'Semester 1'],
  ['DBMS LAB', 'Database Management System Lab', 'Semester 1'],
  ['AI LAB', 'Artificial Intelligence Lab', 'Semester 1'],
].map(([code, name, semester], index) => ({ id: `default-subject-${index}`, code, name, semester }))

const starterData = {
  tasks: [],
  notes: [],
  cards: [],
  subjects: defaultSubjects,
  timetable: {},
}

const timetableDays = [
  { day: 'Sunday', active: true, classes: 'No classes' },
  { day: 'Monday', classes: 'No classes' },
  { day: 'Tuesday', classes: 'No classes' },
  { day: 'Wednesday', classes: 'No classes' },
  { day: 'Thursday', classes: 'No classes' },
  { day: 'Friday', classes: 'No classes' },
  { day: 'Saturday', classes: 'No classes' },
]

const assistantSuggestions = [
  'Explain binary search simply',
  'Make me a study plan for today',
  'What should I study first?',
]

function localAssistantAnswer(query, data) {
  const prompt = query.toLowerCase()
  const subjectNames = data.subjects.map((subject) => subject.name).join(', ')
  if (/\b(hi|hello|hey)\b/.test(prompt)) return 'Hello! I can explain B.Tech topics, create study plans, and help you organize your StudyAI workspace.'
  if (prompt.includes('study plan') || prompt.includes('what should i study')) return `Here is a focused plan: 1) Spend 25 minutes on ${data.subjects[0]?.name || 'your highest-priority subject'}. 2) Take a 5-minute break. 3) Review one note or create three flashcards. 4) Finish by checking your pending tasks (${data.tasks.filter((task) => task.status !== 'Completed').length}).`
  if (prompt.includes('binary search')) return 'Binary search finds an item in a sorted list by repeatedly checking the middle. If the target is smaller, search the left half; if larger, search the right half. Its time complexity is O(log n).'
  if (prompt.includes('subjects') || prompt.includes('courses')) return `Your current subjects are: ${subjectNames || 'none yet'}. I can help you make a revision plan for any of them.`
  if (prompt.includes('task') || prompt.includes('assignment')) return `You have ${data.tasks.filter((task) => task.status !== 'Completed').length} pending tasks and ${data.tasks.filter((task) => task.status === 'Completed').length} completed tasks. Open Tasks to add, complete, or filter assignments.`
  const calculation = query.trim().match(/^(-?\d+(?:\.\d+)?)\s*([+\-*%/])\s*(-?\d+(?:\.\d+)?)$/)
  if (calculation) {
    const left = Number(calculation[1])
    const right = Number(calculation[3])
    const operations = { '+': left + right, '-': left - right, '*': left * right, '/': right ? left / right : 'undefined', '%': right ? left % right : 'undefined' }
    return `The answer is ${operations[calculation[2]]}.`
  }
  return `I can help with study topics, revision plans, tasks, and your ${data.subjects.length} subjects. For a broader answer, add a Gemini key as VITE_GEMINI_API_KEY in a local .env file.`
}

async function getGeminiAnswer(query, data) {
  const context = `The student has ${data.subjects.length} subjects, ${data.tasks.length} tasks, ${data.notes.length} notes, and ${data.cards.length} flashcards.`
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: `You are StudyAI, a concise and encouraging B.Tech study assistant. ${context} Answer this student query clearly and practically: ${query}` }] }] }),
  })
  if (!response.ok) throw new Error('Gemini request failed')
  const result = await response.json()
  return result.candidates?.[0]?.content?.parts?.[0]?.text || localAssistantAnswer(query, data)
}

function readData() {
  try {
    const savedData = JSON.parse(localStorage.getItem(storageKey) || '{}')
    const savedSubjects = savedData.subjects || []
    const existingNames = new Set(savedSubjects.map((subject) => subject.name))
    const missingSubjects = starterData.subjects.filter((subject) => !existingNames.has(subject.name))
    return { ...starterData, ...savedData, subjects: [...savedSubjects, ...missingSubjects] }
  } catch {
    return starterData
  }
}

function App() {
  const [activeView, setActiveView] = useState('Dashboard')
  const [focusMode, setFocusMode] = useState('Focus')
  const [secondsLeft, setSecondsLeft] = useState(initialFocusSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [data, setData] = useState(readData)
  const [taskFilter, setTaskFilter] = useState('All')
  const [noteSearch, setNoteSearch] = useState('')
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantMessages, setAssistantMessages] = useState([
    { role: 'assistant', text: 'Hi! I am your StudyAI assistant. Ask me about a B.Tech topic, your study plan, or your workspace.' },
  ])
  const [assistantLoading, setAssistantLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data))
  }, [data])

  const updateData = (key, value) => setData((current) => ({ ...current, [key]: value }))
  const addItem = (key, item) => updateData(key, [...data[key], { ...item, id: crypto.randomUUID() }])
  const removeItem = (key, id) => updateData(key, data[key].filter((item) => item.id !== id))

  const addTask = () => {
    const title = window.prompt('Task title')
    if (!title?.trim()) return
    addItem('tasks', { title: title.trim(), status: 'Pending', due: window.prompt('Due date (optional)') || 'No due date' })
  }

  const addNote = () => {
    const title = window.prompt('Note title')
    if (!title?.trim()) return
    addItem('notes', { title: title.trim(), body: window.prompt('Note content') || '' })
  }

  const addCard = () => {
    const question = window.prompt('Flashcard question')
    if (!question?.trim()) return
    addItem('cards', { question: question.trim(), answer: window.prompt('Answer') || '' })
  }

  const addSubject = () => {
    const name = window.prompt('Subject name')
    if (!name?.trim()) return
    addItem('subjects', { name: name.trim(), code: (window.prompt('Short code') || 'S').slice(0, 3).toUpperCase(), semester: 'Current semester' })
  }

  const addClass = (day) => {
    const title = window.prompt(`Class for ${day}`)
    if (!title?.trim()) return
    updateData('timetable', { ...data.timetable, [day]: [...(data.timetable[day] || []), { id: crypto.randomUUID(), title: title.trim() }] })
  }

  const askAssistant = async (question = assistantInput) => {
    const cleanQuestion = question.trim()
    if (!cleanQuestion || assistantLoading) return
    setAssistantMessages((messages) => [...messages, { role: 'user', text: cleanQuestion }])
    setAssistantInput('')
    setAssistantLoading(true)
    let answer
    try {
      answer = geminiApiKey ? await getGeminiAnswer(cleanQuestion, data) : localAssistantAnswer(cleanQuestion, data)
    } catch {
      answer = `${localAssistantAnswer(cleanQuestion, data)} Gemini could not be reached, so I used offline mode.`
    } finally {
      setAssistantLoading(false)
    }
    setAssistantMessages((messages) => [...messages, { role: 'assistant', text: answer }])
  }

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
            {[
              { label: 'Subjects', value: data.subjects.length, icon: '📘', accent: 'blue', detail: 'Active courses' },
              { label: 'Pending Tasks', value: data.tasks.filter((task) => task.status !== 'Completed').length, icon: '✅', accent: 'amber', detail: `${data.tasks.filter((task) => task.status === 'Completed').length} completed` },
              { label: 'Study Time', value: `${completedPomodoros * 25}m`, icon: '⏱️', accent: 'green', detail: 'This week' },
              { label: 'Overdue', value: data.tasks.filter((task) => task.status === 'Overdue').length, icon: '⚠️', accent: 'red', detail: 'No blockers' },
            ].map((card) => (
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
                <button type="button" onClick={() => setActiveView('Tasks')}>View all →</button>
              </div>
              <div className="empty-state large">
                <div className="empty-icon">✓</div>
                <p>No upcoming deadlines. You&apos;re all caught up!</p>
                <button type="button" className="primary-btn" onClick={addTask}>+ Add a task</button>
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
              <button type="button" className="secondary-btn" onClick={() => setActiveView('Focus Timer')}>▶ Start Focus Session</button>
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
            <button type="button" className="primary-btn large" onClick={addTask}>+ New Task</button>
          </header>

          <div className="filters">
            {['All', 'Pending', 'In Progress', 'Completed', 'Overdue'].map((filter) => (
              <button type="button" key={filter} className={taskFilter === filter ? 'active' : ''} onClick={() => setTaskFilter(filter)}>
                {filter} {filter === 'All' ? data.tasks.length : data.tasks.filter((task) => task.status === filter).length}
              </button>
            ))}
          </div>

          {data.tasks.filter((task) => taskFilter === 'All' || task.status === taskFilter).length ? <div className="item-list panel-box">
            {data.tasks.filter((task) => taskFilter === 'All' || task.status === taskFilter).map((task) => (
              <div className="list-item" key={task.id}>
                <button type="button" className="check-btn" onClick={() => updateData('tasks', data.tasks.map((item) => item.id === task.id ? { ...item, status: item.status === 'Completed' ? 'Pending' : 'Completed' } : item))}>{task.status === 'Completed' ? '✓' : '○'}</button>
                <span className={task.status === 'Completed' ? 'done' : ''}>{task.title}</span><small>{task.due}</small>
                <button type="button" className="delete-btn" onClick={() => removeItem('tasks', task.id)}>Delete</button>
              </div>
            ))}
          </div> : <div className="empty-state panel-box">
            <div className="empty-icon">✓</div>
            <p>No tasks here. Create one to get started!</p>
            <button type="button" className="primary-btn" onClick={addTask}>+ New Task</button>
          </div>}
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
            <button type="button" className="primary-btn large" onClick={addNote}>+ New Note</button>
          </header>

          <div className="search-row">
            <input className="search-box" value={noteSearch} onChange={(event) => setNoteSearch(event.target.value)} placeholder="🔎 Search notes..." />
            <div className="filter-select">All subjects ▾</div>
          </div>

          {data.notes.filter((note) => `${note.title} ${note.body}`.toLowerCase().includes(noteSearch.toLowerCase())).length ? <div className="note-grid">{data.notes.filter((note) => `${note.title} ${note.body}`.toLowerCase().includes(noteSearch.toLowerCase())).map((note) => <article className="note-card" key={note.id}><div><h3>{note.title}</h3><p>{note.body || 'No content yet'}</p></div><button type="button" className="delete-btn" onClick={() => removeItem('notes', note.id)}>Delete</button></article>)}</div> : <div className="empty-state panel-box wide">
            <div className="empty-icon paper-icon">📝</div>
            <p>No notes yet. Create your first note!</p>
            <button type="button" className="primary-btn" onClick={addNote}>+ New Note</button>
          </div>}
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
              <button type="button" className="study-btn" onClick={() => window.alert(data.cards.length ? `You have ${data.cards.length} cards ready to study.` : 'Create a card first.')}>✦ Study</button>
              <button type="button" className="primary-btn large" onClick={addCard}>+ New Card</button>
            </div>
          </header>

          <div className="filters compact-filters">
            {['All', 'Data structure'].map((filter) => (
              <button type="button" key={filter} className={filter === 'All' ? 'active' : ''}>
                {filter} ({filter === 'All' ? data.cards.length : data.cards.filter((card) => card.subject === filter).length})
              </button>
            ))}
          </div>

          {data.cards.length ? <div className="card-grid">{data.cards.map((card) => <article className="flashcard" key={card.id}><div><span>QUESTION</span><h3>{card.question}</h3><p>{card.answer}</p></div><button type="button" className="delete-btn" onClick={() => removeItem('cards', card.id)}>Delete</button></article>)}</div> : <div className="empty-state panel-box large-box">
            <div className="empty-icon card-icon">▣</div>
            <p>No flashcards yet. Create some to start studying!</p>
            <button type="button" className="primary-btn" onClick={addCard}>+ New Card</button>
          </div>}
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
            {timetableDays.map((slot) => (
              <div key={slot.day} className={`day-card ${slot.active ? 'active' : ''}`}>
                <div className="day-title-row">
                  <span>{slot.day}</span>
                  {slot.active ? <span className="day-badge">Today</span> : <button type="button" onClick={() => addClass(slot.day)}>+</button>}
                </div>
                {data.timetable[slot.day]?.length ? data.timetable[slot.day].map((item) => <div className="class-item" key={item.id}>{item.title}<button type="button" onClick={() => updateData('timetable', { ...data.timetable, [slot.day]: data.timetable[slot.day].filter((entry) => entry.id !== item.id) })}>×</button></div>) : <p>{slot.classes}</p>}
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
            <button type="button" className="primary-btn large" onClick={addSubject}>+ Add Subject</button>
          </header>

          <div className="subject-list">
            {data.subjects.map((subject) => (
              <article key={subject.id || subject.name} className="subject-card">
                <div className="subject-badge">{subject.code}</div>
                <div>
                  <h3>{subject.name}</h3>
                  <p>{subject.semester}</p>
                </div>
                {!subject.id?.startsWith('default-') && <button type="button" className="delete-btn" onClick={() => removeItem('subjects', subject.id)}>Delete</button>}
              </article>
            ))}
          </div>
        </>
      )
    }

    if (activeView === 'AI Assistant') {
      return (
        <>
          <header className="page-header assistant-header">
            <div>
              <div className="eyebrow">STUDY COMPANION</div>
              <h1>AI Assistant</h1>
              <p>Get clear explanations and turn questions into your next study step.</p>
            </div>
            <div className="assistant-status"><span /> Ready to help</div>
          </header>
          <section className="assistant-layout">
            <div className="assistant-chat panel">
              <div className="chat-header"><div><h2>StudyAI Copilot</h2><p>Personalized to your subjects, tasks, and notes</p></div><span className="chat-dot" /></div>
              <div className="message-list" aria-live="polite">
                {assistantMessages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}><span className="message-avatar">{message.role === 'assistant' ? '✦' : 'You'}</span><p>{message.text}</p></div>)}
                {assistantLoading && <div className="message assistant"><span className="message-avatar">✦</span><p>Thinking...</p></div>}
              </div>
              <form className="assistant-form" onSubmit={(event) => { event.preventDefault(); askAssistant() }}>
                <input value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} placeholder="Ask anything about your studies..." aria-label="Ask the StudyAI assistant" />
                <button type="submit" className="primary-btn" aria-label="Send question" disabled={assistantLoading}>Send →</button>
              </form>
            </div>
            <aside className="assistant-tools panel"><h2>Try asking</h2><div className="suggestion-list">{assistantSuggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => askAssistant(suggestion)}>{suggestion}<span>↗</span></button>)}</div><div className="context-card"><span>CONTEXT AWARE</span><strong>{data.subjects.length} subjects</strong><p>{data.tasks.length} tasks · {data.notes.length} notes · {data.cards.length} flashcards</p></div></aside>
          </section>
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
          <small className="developer-credit">Developed by Monu Jha</small>
        </div>
      </aside>

      <main className="main-panel">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
