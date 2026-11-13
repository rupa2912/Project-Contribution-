import { useState } from 'react';
import ProjectSetup from './components/ProjectSetup.jsx';
import TaskBoard from './components/TaskBoard.jsx';
import AnalyticsView from './components/AnalyticsView.jsx';

/**
 * App — top-level state controller and screen router.
 *
 * Screens:
 *   setup     → ProjectSetup   (create project, add members)
 *   board     → TaskBoard      (assign tasks, mark complete)
 *   analytics → AnalyticsView  (contribution report)
 */
export default function App() {
  const [screen, setScreen]   = useState('setup');
  const [project, setProject] = useState(null); // { id, project_name }

  const goToBoard     = (proj) => { setProject(proj); setScreen('board'); };
  const goToAnalytics = ()     => setScreen('analytics');
  const goToSetup     = ()     => { setProject(null); setScreen('setup'); };

  return (
    <div className="app-wrapper">
      {/* ── Header ── */}
      <header className="app-header">
        <h1>🎓 Group Contribution Tracker</h1>
        {project && (
          <nav className="app-nav">
            <button
              className={screen === 'board' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setScreen('board')}
            >
              Task Board
            </button>
            <button
              className={screen === 'analytics' ? 'nav-btn active' : 'nav-btn'}
              onClick={goToAnalytics}
            >
              Analytics
            </button>
            <button className="nav-btn secondary" onClick={goToSetup}>
              New Project
            </button>
          </nav>
        )}
      </header>

      {/* ── Project badge ── */}
      {project && (
        <div className="project-badge">
          Project: <strong>{project.project_name}</strong>
        </div>
      )}

      {/* ── Screen router ── */}
      <main className="app-main">
        {screen === 'setup' && (
          <ProjectSetup onInitialise={goToBoard} />
        )}
        {screen === 'board' && project && (
          <TaskBoard projectId={project.id} />
        )}
        {screen === 'analytics' && project && (
          <AnalyticsView projectId={project.id} />
        )}
      </main>
    </div>
  );
}
