/**
 * API service layer
 * Node.js backend  → http://localhost:5000
 * Python backend   → http://localhost:5001
 */
import axios from 'axios';

const node   = axios.create({ baseURL: 'http://localhost:5000/api' });
const python = axios.create({ baseURL: 'http://localhost:5001/api' });

// ── Projects ─────────────────────────────────────────────────────────────────
export const createProject = (projectName) =>
  node.post('/projects', { project_name: projectName }).then((r) => r.data);

export const getProjects = () =>
  node.get('/projects').then((r) => r.data);

// ── Members ───────────────────────────────────────────────────────────────────
export const addMember = (projectId, name) =>
  node.post(`/projects/${projectId}/members`, { name }).then((r) => r.data);

export const getMembers = (projectId) =>
  node.get(`/projects/${projectId}/members`).then((r) => r.data);

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const createTask = (projectId, memberId, title) =>
  node.post(`/projects/${projectId}/tasks`, { member_id: memberId, title }).then((r) => r.data);

export const getTasks = (projectId) =>
  node.get(`/projects/${projectId}/tasks`).then((r) => r.data);

export const updateTaskStatus = (taskId, status) =>
  node.patch(`/tasks/${taskId}`, { status }).then((r) => r.data);

// ── Analytics (Python Flask) ──────────────────────────────────────────────────
export const getAnalytics = (projectId) =>
  python.get(`/analytics/${projectId}`).then((r) => r.data);
