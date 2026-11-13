/**
 * Group Assignment Contribution Tracker — Node.js Backend
 * Member 2: Backend Lead
 *
 * Stack : Express + SQLite (sqlite3)
 * Port  : 5000
 * DB    : ./database.db  (shared with Member 3's Python analytics service)
 */

const express = require('express');
const cors    = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const app  = express();
const PORT = 5000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:3000',    // Member 1's React app
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());              // Parse JSON request bodies

// ─── Database Setup ──────────────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'database.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌  Error opening database:', err.message);
    process.exit(1);
  }
  console.log(`✅  Connected to SQLite database at ${DB_PATH}`);
});

// Enable foreign-key enforcement and create tables on startup
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT    NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name       TEXT    NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      member_id  INTEGER NOT NULL,
      title      TEXT    NOT NULL,
      status     TEXT    NOT NULL DEFAULT 'pending',
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id)  REFERENCES members(id)  ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Schema init error:', err.message);
    else     console.log('✅  Database schema ready.');
  });
});

// ─── Helper ──────────────────────────────────────────────────────────────────
/**
 * Wraps db.get / db.run / db.all in Promises so we can use async/await.
 */
const dbGet  = (sql, params = []) => new Promise((res, rej) =>
  db.get(sql, params, (err, row)  => err ? rej(err) : res(row)));

const dbRun  = (sql, params = []) => new Promise((res, rej) =>
  db.run(sql, params, function (err) { err ? rej(err) : res(this); }));

const dbAll  = (sql, params = []) => new Promise((res, rej) =>
  db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));

// ─── Routes ──────────────────────────────────────────────────────────────────

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Contribution Tracker API is running.' });
});

// ── POST /api/projects ───────────────────────────────────────────────────────
// Creates a new group project.
// Body : { "project_name": "AI Capstone" }
// Resp : { "id": 1, "project_name": "AI Capstone" }
app.post('/api/projects', async (req, res) => {
  const { project_name } = req.body;

  if (!project_name || !project_name.trim()) {
    return res.status(400).json({ error: 'project_name is required.' });
  }

  try {
    const result = await dbRun(
      'INSERT INTO projects (project_name) VALUES (?)',
      [project_name.trim()]
    );
    res.status(201).json({ id: result.lastID, project_name: project_name.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

// ── GET /api/projects ────────────────────────────────────────────────────────
// Lists all projects (bonus convenience endpoint for the frontend).
app.get('/api/projects', async (_req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM projects ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

// ── GET /api/projects/:id ────────────────────────────────────────────────────
// Returns a single project by id.
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
});

// ── POST /api/projects/:id/members ───────────────────────────────────────────
// Adds a team member to a specific project.
// Body : { "name": "Priya" }
// Resp : { "id": 1, "project_id": 1, "name": "Priya" }
app.post('/api/projects/:id/members', async (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  const { name }  = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required.' });
  }

  try {
    // Verify the project exists
    const project = await dbGet('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    const result = await dbRun(
      'INSERT INTO members (project_id, name) VALUES (?, ?)',
      [projectId, name.trim()]
    );
    res.status(201).json({ id: result.lastID, project_id: projectId, name: name.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add member.' });
  }
});

// ── GET /api/projects/:id/members ────────────────────────────────────────────
// Returns all members of a project (used by frontend task-assignment dropdown).
// Resp : [ { "id": 1, "project_id": 1, "name": "Priya" }, … ]
app.get('/api/projects/:id/members', async (req, res) => {
  try {
    const project = await dbGet('SELECT id FROM projects WHERE id = ?', [req.params.id]);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    const rows = await dbAll(
      'SELECT * FROM members WHERE project_id = ? ORDER BY id',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch members.' });
  }
});

// ── POST /api/projects/:id/tasks ─────────────────────────────────────────────
// Creates a task assigned to a member within a project.
// Body : { "member_id": 1, "title": "Build UI" }
// Resp : { "id": 1, "project_id": 1, "member_id": 1, "title": "Build UI", "status": "pending" }
app.post('/api/projects/:id/tasks', async (req, res) => {
  const projectId       = parseInt(req.params.id, 10);
  const { member_id, title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required.' });
  }
  if (!member_id) {
    return res.status(400).json({ error: 'member_id is required.' });
  }

  try {
    // Verify project exists
    const project = await dbGet('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    // Verify member belongs to this project
    const member = await dbGet(
      'SELECT id FROM members WHERE id = ? AND project_id = ?',
      [member_id, projectId]
    );
    if (!member) return res.status(404).json({ error: 'Member not found in this project.' });

    const result = await dbRun(
      'INSERT INTO tasks (project_id, member_id, title, status) VALUES (?, ?, ?, ?)',
      [projectId, member_id, title.trim(), 'pending']
    );
    res.status(201).json({
      id: result.lastID,
      project_id: projectId,
      member_id: parseInt(member_id, 10),
      title: title.trim(),
      status: 'pending',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// ── GET /api/projects/:id/tasks ───────────────────────────────────────────────
// Returns all tasks for a project (used by frontend to render boards).
// Resp : [ { id, project_id, member_id, title, status }, … ]
app.get('/api/projects/:id/tasks', async (req, res) => {
  try {
    const project = await dbGet('SELECT id FROM projects WHERE id = ?', [req.params.id]);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    const rows = await dbAll(
      `SELECT t.*, m.name AS member_name
       FROM   tasks   t
       JOIN   members m ON m.id = t.member_id
       WHERE  t.project_id = ?
       ORDER  BY t.id`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
// Updates a task's status (toggles pending ↔ completed, or sets explicitly).
// Body : { "status": "completed" }
// Resp : { "updated": 1 }
app.patch('/api/tasks/:id', async (req, res) => {
  const taskId  = parseInt(req.params.id, 10);
  const { status } = req.body;

  const VALID_STATUSES = ['pending', 'completed'];
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}.` });
  }

  try {
    const task = await dbGet('SELECT id FROM tasks WHERE id = ?', [taskId]);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const result = await dbRun(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, taskId]
    );
    res.json({ updated: result.changes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Contribution Tracker API running on http://localhost:${PORT}`);
  console.log(`    Health : GET  http://localhost:${PORT}/api/health`);
  console.log(`    DB     : ${DB_PATH}\n`);
});
