import { useState, useEffect } from 'react';
import { getAnalytics } from '../services/api.js';
import './AnalyticsView.css';

/**
 * Screen 3 — Analytics View
 * Fetches contribution summary from Member 3's Python Flask backend (port 5001).
 */
export default function AnalyticsView({ projectId }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getAnalytics(projectId)
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError('Could not load analytics. Is the Python backend running on port 5001?');
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div className="spinner" />;
  if (error)   return (
    <div className="card">
      <p className="error-msg">{error}</p>
    </div>
  );
  if (!data) return null;

  return (
    <div className="analytics-container">

      {/* ── Summary strip ── */}
      <div className="summary-strip">
        <StatBox label="Total Tasks"     value={data.total_tasks}     color="#2b4a8c" />
        <StatBox label="Completed"       value={data.completed_tasks} color="#16a34a" />
        <StatBox label="Overall Progress" value={`${data.overall_progress}%`} color="#ea580c" />
      </div>

      {/* ── Progress bar ── */}
      <div className="card">
        <h2>📊 Overall Progress</h2>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${data.overall_progress}%` }}
          />
        </div>
        <p className="progress-label">{data.overall_progress}% complete</p>
      </div>

      {/* ── Member breakdown ── */}
      <div className="card">
        <h2>👥 Member Contributions</h2>
        {data.members.length === 0
          ? <p className="empty-msg">No members found.</p>
          : data.members.map((member) => (
            <div key={member.id} className="member-row">
              <div className="member-meta">
                <span className="member-name">{member.name}</span>
                <span className="member-stats">
                  {member.completed_tasks}/{member.assigned_tasks} tasks &nbsp;·&nbsp;
                  <strong>{member.contribution_percentage}%</strong> contribution
                </span>
              </div>
              <div className="mini-bar-bg">
                <div
                  className="mini-bar-fill"
                  style={{ width: `${member.contribution_percentage}%` }}
                />
              </div>
            </div>
          ))
        }
      </div>

    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="stat-box" style={{ borderTopColor: color }}>
      <span className="stat-value" style={{ color }}>{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
