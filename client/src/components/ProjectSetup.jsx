import { useState } from 'react';
import { createProject, addMember } from '../services/api.js';
import './ProjectSetup.css';

/**
 * Screen 1 — Project Setup
 * User names the project, adds team members, then clicks Initialise.
 * onInitialise(project) → navigates to TaskBoard
 */
export default function ProjectSetup({ onInitialise }) {
  const [projectName, setProjectName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [memberList,  setMemberList]  = useState([]); // local staging list
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  /* Add member to local staging list (not saved to DB yet) */
  const handleAddMember = () => {
    const name = memberInput.trim();
    if (!name) return;
    if (memberList.includes(name)) {
      setError('Member already added.');
      return;
    }
    setMemberList((prev) => [...prev, name]);
    setMemberInput('');
    setError('');
  };

  const handleRemoveMember = (name) =>
    setMemberList((prev) => prev.filter((m) => m !== name));

  /* Create project + all members, then hand off */
  const handleInitialise = async () => {
    if (!projectName.trim()) { setError('Please enter a project name.'); return; }
    if (memberList.length === 0) { setError('Add at least one team member.'); return; }

    setLoading(true);
    setError('');
    try {
      const project = await createProject(projectName.trim());
      await Promise.all(memberList.map((name) => addMember(project.id, name)));
      onInitialise(project);
    } catch (err) {
      console.error(err);
      setError('Failed to initialise project. Is the Node.js backend running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="card">
        <h2>🚀 Create a New Project</h2>

        {/* Project name */}
        <label className="field-label">Project Name</label>
        <div className="input-row">
          <input
            type="text"
            placeholder="e.g. AI Capstone"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInitialise()}
          />
        </div>

        {/* Add members */}
        <label className="field-label">Team Members</label>
        <div className="input-row">
          <input
            type="text"
            placeholder="Member name"
            value={memberInput}
            onChange={(e) => setMemberInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
          />
          <button className="btn btn-primary" onClick={handleAddMember}>
            + Add
          </button>
        </div>

        {/* Member chips */}
        {memberList.length > 0 && (
          <div className="member-chips">
            {memberList.map((name) => (
              <span key={name} className="chip">
                {name}
                <button
                  className="chip-remove"
                  onClick={() => handleRemoveMember(name)}
                  aria-label={`Remove ${name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}

        <button
          className="btn btn-success initialise-btn"
          onClick={handleInitialise}
          disabled={loading}
        >
          {loading ? 'Initialising…' : '✓ Initialise Project'}
        </button>
      </div>
    </div>
  );
}
