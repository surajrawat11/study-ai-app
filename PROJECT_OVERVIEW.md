# StudyAI Project Overview

## Project Identity

- **Project name:** StudyAI
- **Repository:** https://github.com/surajrawat11/study-ai-app
- **Local workspace:** `C:\Users\user\Desktop\study-ai app`
- **Application type:** React single-page application
- **Build tool:** Vite
- **Current branch:** `master`
- **Latest commit:** `86e6d8e Polish study dashboard interface`
- **Repository status:** Clean and synced with GitHub
- **Developer attribution:** Developed by Monu Jha

## Purpose

StudyAI is a B.Tech student productivity application for organizing academic work and building consistent study habits.

The application currently provides:

- Academic subject management
- Assignment and task tracking
- Study notes
- Flashcards
- Weekly timetable planning
- Pomodoro focus sessions
- Study progress summaries

The visual design is a dark academic dashboard with blue primary actions, green focus actions, responsive layouts, and compact information panels.

## Technology Stack

- React `19.2.8`
- React DOM `19.2.8`
- Vite `8.2.2`
- JavaScript with JSX
- CSS
- Oxlint
- Browser `localStorage`
- Google Fonts:
  - DM Sans
  - Space Grotesk

The project currently does not use:

- TypeScript
- React Router
- Tailwind CSS
- A backend server
- A database
- Authentication
- External APIs
- An AI model or AI service
- A state-management library

## Main Files

### `src/App.jsx`

Contains the main application logic and UI rendering.

Responsibilities:

- Navigation state
- Dashboard rendering
- Task management
- Note management
- Flashcard management
- Subject management
- Timetable management
- Focus timer logic
- Browser storage synchronization
- Existing-data migration

### `src/App.css`

Contains application-specific styles:

- Sidebar and navigation
- Dashboard cards
- Panels and empty states
- Subject grid
- Timetable cards
- Focus timer
- Notes and flashcards
- Responsive layouts
- Buttons and controls
- Page entrance animation

### `src/index.css`

Contains global styling:

- Font imports
- Root colors
- Body background
- Global box sizing
- Typography defaults
- Button and input font inheritance

### `src/main.jsx`

Mounts the React application into the `root` element using React Strict Mode.

### `package.json`

Defines dependencies and scripts:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### `vite.config.js`

Configures Vite with the React plugin.

## Application Navigation

The sidebar contains seven views:

1. Dashboard
2. Tasks
3. Notes
4. Flashcards
5. Timetable
6. Focus Timer
7. Subjects

Navigation is currently handled with React state. Selecting an item changes the active screen without a full page reload.

## Dashboard

The Dashboard contains:

- Welcome message
- Subject count
- Pending task count
- Study time summary
- Overdue task count
- Upcoming deadlines panel
- Study progress panel
- Weekly progress indicators
- Link to Tasks
- Link to Focus Timer

The summary cards use live subject and task data. Study time is currently calculated from completed focus sessions during the current page session.

## Tasks

Current functionality:

- Create a task
- Add an optional due date
- Filter by status:
  - All
  - Pending
  - In Progress
  - Completed
  - Overdue
- Mark a task complete or pending
- Delete a task
- Display task records
- Persist tasks in browser storage

Task records currently use this general shape:

```js
{
  id,
  title,
  status,
  due
}
```

Task creation currently uses browser prompt dialogs instead of a custom form modal.

## Notes

Current functionality:

- Create a note
- Add a note title
- Add note content
- Search notes by title or content
- Delete notes
- Persist notes in browser storage

Note records currently use this general shape:

```js
{
  id,
  title,
  body
}
```

## Flashcards

Current functionality:

- Create a flashcard
- Add a question
- Add an answer
- Display saved flashcards
- Delete flashcards
- Show the total flashcard count
- Persist flashcards in browser storage
- Study button reports the number of available cards

Flashcard records currently use this general shape:

```js
{
  id,
  question,
  answer
}
```

The study experience is currently a basic foundation. It does not yet include card flipping, next/previous navigation, answer scoring, spaced repetition, or study history.

## Timetable

Current functionality:

- Display all seven days
- Highlight Sunday as today
- Add a class to a day
- Remove a class
- Persist timetable entries in browser storage

Current class records contain:

```js
{
  id,
  title
}
```

Future timetable fields could include start time, end time, room, teacher, subject, class type, and recurring schedule.

## Focus Timer

The Focus Timer follows the Pomodoro technique.

Available modes:

- Focus: 25 minutes
- Short Break: 5 minutes
- Long Break: 15 minutes

Current functionality:

- Start timer
- Pause timer
- Reset timer
- Switch timer mode
- Automatically switch from Focus to Short Break
- Track completed focus sessions during the current page session

The timer uses React `useEffect` and browser `setInterval`.

Focus-session totals are not currently persisted after a page refresh.

## Subjects

The application includes the provided B.Tech curriculum:

- Data structure
- Design and Analysis of Algorithm
- Web Technology
- Database Management System
- Mechanics of Robotics
- Data Encryption and Compression
- Cloud Computing
- Artificial Intelligence
- Data Analytics
- Data Warehousing & Data Mining
- Constitution of India
- Design and Analysis of Algorithm Lab
- Web Technology Lab
- Database Management System Lab
- Artificial Intelligence Lab

Users can also:

- Add custom subjects
- Delete custom subjects
- View semester information

Default subjects are merged into existing saved data without duplicating subjects. Older single-subject saved data is migrated automatically.

Subject records currently use this general shape:

```js
{
  id,
  code,
  name,
  semester
}
```

## Persistent Storage

All application data is stored in the browser using:

```text
localStorage key: study-ai-data
```

Stored data includes:

```js
{
  tasks: [],
  notes: [],
  cards: [],
  subjects: [],
  timetable: {}
}
```

This means:

- Data survives page refreshes
- Data is specific to the current browser
- Data is not synchronized between devices
- Data is not shared between users
- Clearing browser storage deletes the data
- There is currently no account recovery

## Visual Design

The current design uses:

- Dark navy and blue background colors
- Blue primary buttons
- Green focus actions
- Amber task accents
- Red overdue accents
- Rounded panels and cards
- Light blue text hierarchy
- Gradient backgrounds
- Responsive CSS grids
- Subtle page entrance animation

Typography:

- Space Grotesk for major headings
- DM Sans for body text and controls

## Responsive Behavior

The interface includes breakpoints for desktop, tablet, and mobile screens.

On smaller screens:

- The sidebar becomes stacked
- Summary cards use fewer columns
- Subject cards become one column
- Timetable cards become one column
- Focus timer scales down
- Header actions stack vertically
- Search and filter controls stack vertically

## Git History

Major project milestones:

```text
197973a Initial advanced study dashboard prototype
41f3a9e Make study app features interactive
ac0204f Fix dashboard runtime crash
eba202e Fix timetable view rendering
b6eface Restore starter subjects
9f0fbe4 Add curriculum subjects and developer credit
86e6d8e Polish study dashboard interface
```

Each significant feature milestone has been committed and pushed to GitHub.

## Running the Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local application:

```text
http://localhost:5173/
```

Create a production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

## Verification Status

The project has been verified with:

- Successful `npm run build`
- Successful `npm run lint`
- VS Code diagnostics with no errors in touched source files
- Browser rendering verification
- Dashboard navigation verification
- Timetable navigation verification
- Subject-data migration verification
- GitHub push verification

## Current Limitations

The application is currently a functional frontend prototype.

Known limitations:

- No backend
- No database
- No login or registration
- No cloud synchronization
- Prompt-based creation forms are basic
- Dashboard deadline presentation is still limited
- Some progress information is simplified
- Focus totals are not persisted
- Flashcard Study mode is not complete
- No edit functionality for existing records
- No custom confirmation dialogs
- Limited validation for duplicate subjects
- No error boundary
- No automated browser test suite
- No deployment configuration
- No real AI assistant functionality yet

## Recommended Next Milestones

### 1. Improve Forms

Replace browser prompts with reusable modal forms for:

- Tasks
- Notes
- Flashcards
- Subjects
- Timetable classes

Add validation, cancel buttons, and clear error messages.

### 2. Improve Task Management

Add:

- Priority
- Subject selection
- Due date and time
- Sorting
- Editing
- Better status controls
- Deadline highlighting

### 3. Build Real Flashcard Study Mode

Add:

- Flip card interaction
- Next and previous controls
- Correct and incorrect scoring
- Progress indicator
- Study session history
- Spaced repetition

### 4. Improve Focus Tracking

Persist:

- Completed sessions
- Total focus time
- Daily history
- Weekly history
- Subject-specific focus time

### 5. Add Backend and Authentication

A future backend could provide:

- User accounts
- Cloud data storage
- Multi-device synchronization
- Secure data ownership
- Backup and recovery

### 6. Add AI Features

Potential AI functionality:

- Note summarization
- Quiz generation
- Flashcard generation from notes
- Assignment breakdown
- Study-plan generation
- Subject explanations
- Weak-topic detection

### 7. Add Testing and Deployment

Recommended tools and workflows:

- Playwright browser tests
- Component tests
- Accessibility checks
- Continuous integration
- Production environment variables
- Public deployment

## Project Summary

StudyAI is now a clean, responsive React/Vite frontend foundation for a B.Tech academic productivity platform. It has a polished dashboard, working local data flows, curriculum subjects, a Pomodoro timer, Git tracking, and a public GitHub repository.

The next major technical step is moving from browser prompts and local-only storage to reusable forms, durable data models, authentication, and a backend service.
