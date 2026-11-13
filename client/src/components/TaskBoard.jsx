import { useState, useEffect, useCallback } from 'react';
import { getMembers, getTasks, createTask, updateTaskStatus } from '../services/api.js';
import './TaskBoard.css';

/**
 * Screen 2 — Task Board
 * Assign tasks to members; mark pending tasks complete (or reopen).
 */
export default function TaskBoard({ projectId }) {
  const [members,     setMembers]     = useState([]);
  const [tasks,       setTasks]       = useState([]);
  const [title,       setTitle]       = useState('');
  const [memberId,    setMemberId]    = useState('');
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');

  /* ── Load members + tasks ── */
  const refresh = useCallback(async () => {
    try {
      const [m, t] = await Promise.all([
        getMembers(projectId),
        getTasks(projectId),
      ]);
      setMembers(m);
      setTasks(t);
      if (m.length > 0 && !memberId) setMemberId(String(m[0].id));
    } catch (err) {
      console.error(err);
      setError('Could not load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refresh(); }, [refresh]);

  /* ── Assign task ── */
  const handleAssign = async () => {
    if (!title.trim()) { setError('Task title is required.'); return; }
    if (!memberId)     { setError('Select a member.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await createTask(projectId, parseInt(memberId, 10), title.trim());
      setTitle('');
      await refresh();
    } catch (err) {
      console.error(err);
      setError('Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Toggle status ── */
  const handleToggle = async (task) => {
    const next = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await updateTaskStatus(task.id, next);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: next } : t))
      );
    } catch (err) {
      console.error(err);
      setError('Failed to update task status.');
    }
  };

  const pending   = tasks.filter((t) => t.status === 'pending');
  const completed = tasks.filter((t) => t.status === 'completed');

  if (loading) return <div className="spinner" />;

  return (
    <div className="board-container">

      {/* ── Assign Task ── */}
      <div className="card">
        <h2>📋 Assign a Task</h2>
        <div className="input-row">
          <input
            type="text"
            placeholder="Task title, e.g. Build login form"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAssign()}
          />
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={handleAssign}
            disabled={submitting}
          >
            {submitting ? '…' : 'Assign'}
          </button>
        </div>
        {error && <p className="error-msg">{error}</p>}
      </div>

      {/* ── Columns ── */}
      <div className="board-columns">

        {/* Pending */}
        <div className="board-col">
          <h3 className="col-heading pending-heading">
            🕐 Pending <span className="badge">{pending.length}</span>
          </h3>
          {pending.length === 0
            ? <p className="empty-msg">No pending tasks.</p>
            : pending.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={handleToggle} />
            ))
          }
        </div>

        {/* Completed */}
        <div className="board-col">
          <h3 className="col-heading completed-heading">
            ✅ Completed <span className="badge">{completed.length}</span>
          </h3>
          {completed.length === 0
            ? <p className="empty-msg">No completed tasks yet.</p>
            : completed.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={handleToggle} />
            ))
          }
        </div>

      </div>
    </div>
  );
}

/* ── Task Card ── */
function TaskCard({ task, onToggle }) {
  const isDone = task.status === 'completed';
  return (
    <div className={`task-card ${isDone ? 'done' : ''}`}>
      <div className="task-info">
        <span className="task-title">{task.title}</span>
        <span className="task-member">👤 {task.member_name}</span>
      </div>
      <button
        className={`btn ${isDone ? 'btn-ghost' : 'btn-success'} btn-sm`}
        onClick={() => onToggle(task)}
      >
        {isDone ? 'Reopen' : 'Complete'}
      </button>
    </div>
  );
}
