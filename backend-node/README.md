# Contribution Tracker — Node.js Backend

**Member 2 | Backend Lead**  
Stack: Node.js · Express · SQLite (`sqlite3`)  
Port: `5000`

---

## Quick Start

```bash
cd backend-node
npm install      # first time only
npm start        # production
# or
npm run dev      # auto-restart on file changes (Node ≥ 18)
```

Server starts at **http://localhost:5000**

---

## API Reference

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status check |

### Projects
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/projects` | `{ "project_name": "..." }` | Create a project |
| GET | `/api/projects` | — | List all projects |
| GET | `/api/projects/:id` | — | Get single project |

### Members
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/projects/:id/members` | `{ "name": "..." }` | Add a member |
| GET | `/api/projects/:id/members` | — | List project members |

### Tasks
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/projects/:id/tasks` | `{ "member_id": 1, "title": "..." }` | Assign a task |
| GET | `/api/projects/:id/tasks` | — | List project tasks |
| PATCH | `/api/tasks/:id` | `{ "status": "completed" }` | Update task status |

---

## Database

SQLite file: `./database.db` (auto-created on first run)

**Shared with Member 3 (Python Analytics)** — point Flask at the same `database.db` path.

### Schema
```
projects  : id, project_name
members   : id, project_id, name
tasks     : id, project_id, member_id, title, status
```

---

## Collaboration

- **Member 1 (React Frontend)**: Base URL = `http://localhost:5000/api`
- **Member 3 (Python Analytics)**: SQLite file = `./database.db`
