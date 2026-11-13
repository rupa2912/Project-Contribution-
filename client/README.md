# Member 1 — React Frontend

Group Assignment Contribution Tracker — UI module.

## Tech Stack
React 18 · Vite · Axios · Plain CSS

## Screens
| Screen | File | Purpose |
|---|---|---|
| 1 — Project Setup | `src/components/ProjectSetup.jsx` | Name the project, add/remove team members, hit **Initialise** |
| 2 — Task Board | `src/components/TaskBoard.jsx` | Assign tasks, mark complete, reopen |
| 3 — Analytics | `src/components/AnalyticsView.jsx` | Contribution report from Python backend |

## File Structure
```
client/
├── index.html
├── vite.config.js
└── src/
    ├── main.jsx              ← React entry point
    ├── App.jsx               ← State controller & screen router
    ├── App.css               ← Global styles
    ├── services/
    │   └── api.js            ← Axios wrappers for Node (:5000) & Python (:5001)
    └── components/
        ├── ProjectSetup.jsx / .css
        ├── TaskBoard.jsx     / .css
        └── AnalyticsView.jsx / .css
```

## Running
```bash
cd client
npm install       # first time only
npm run dev       # starts on http://localhost:3000
```

> Make sure Member 2's Node.js backend is on **port 5000** and
> Member 3's Python backend is on **port 5001** before using the app.

## API Contract Expected

### Node.js (port 5000)
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/projects` | Create project → returns `{ id, project_name }` |
| POST | `/api/projects/:id/members` | Add member → returns member object |
| GET  | `/api/projects/:id/members` | List members |
| GET  | `/api/projects/:id/tasks` | List tasks |
| POST | `/api/projects/:id/tasks` | Create task |
| PATCH| `/api/tasks/:id` | Update task status |

### Python Flask (port 5001)
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/analytics/:project_id` | Returns contribution summary |

Expected analytics response shape:
```json
{
  "total_tasks": 10,
  "completed_tasks": 6,
  "overall_progress": 60,
  "members": [
    {
      "id": 1,
      "name": "Alice",
      "assigned_tasks": 4,
      "completed_tasks": 3,
      "contribution_percentage": 50
    }
  ]
}
```
