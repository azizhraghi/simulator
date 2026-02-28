# 🎓 Syntern — AI Internship Simulator

> **Your first job — before your first job.**
> A full remote internship simulation powered by multi-agent AI.

---

## 🧠 Concept

Students lack real work experience. Syntern fixes that by simulating a complete remote internship:
- Real AI agents: Manager, Tech Lead, Client, Senior Intern
- Real tasks with deadlines on a Kanban board
- Slack-like async communication
- Escalation system if you go silent
- Meeting popups at random times
- Full behavioral evaluation report + CV badge

---

## 🏗️ Architecture

```
React Frontend (Vite)
      ↓
n8n Orchestration (Webhooks + Workflows)
      ↓
Claude API (4 AI Agents with different personas)
      ↓
Supabase (Sessions, Messages, Evaluations)
      ↓
Evaluation Engine → PDF Report + Badge
```

---

## 🚀 Quick Start

### 1. Frontend
```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

### 2. n8n Setup
1. Open your n8n instance
2. Go to **Workflows → Import from File**
3. Upload `n8n-workflow.json`
4. Set environment variables:
   - `ANTHROPIC_API_KEY` — your Claude API key
   - `FRONTEND_URL` — your frontend URL (e.g. http://localhost:3000)
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_API_KEY` — your Supabase anon key
5. Activate all workflows

### 3. Supabase Tables
```sql
-- Sessions
create table sessions (
  id uuid default gen_random_uuid() primary key,
  student_name text,
  role text,
  company text,
  duration_minutes int,
  status text default 'active',
  last_message_at timestamptz default now(),
  started_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id),
  channel text,
  sender text,
  content text,
  timestamp timestamptz default now()
);

-- Evaluations
create table evaluations (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id),
  scores jsonb,
  feedback text,
  badge text,
  created_at timestamptz default now()
);
```

---

## 🤖 AI Agents

| Agent | Name | Personality |
|---|---|---|
| Manager | Sara K. | Warm but demanding. Unclear sometimes. Changes priorities. |
| Tech Lead | Marcus T. | Direct, terse. "It's in the docs." Async delays. |
| Client | Nadia R. | Business-focused. Impatient. Wants updates. |
| Senior Intern | Leo B. | Passive-aggressive hints. Optional helper. |

---

## 📊 Evaluation Metrics

- **Communication** — clarity, response time, professional tone
- **Prioritization** — what they opened first, what they ignored
- **Initiative** — did they ask before deadline, proactive updates
- **Professionalism** — Slack maturity, handling pressure
- **Delivery** — tasks completed, quality of work

---

## 🏆 n8n Workflow Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/webhook/syntern/session/start` | POST | Initialize session + schedule timer |
| `/webhook/syntern/message/send` | POST | Route message to correct agent |
| `/webhook/syntern/session/evaluate` | POST | Run behavioral evaluation |

---

## 📁 Project Structure

```
syntern/
├── src/
│   ├── App.jsx          # Full React app (single file)
│   └── main.jsx         # Entry point
├── index.html
├── vite.config.js
├── package.json
├── n8n-workflow.json    # Import this into n8n
└── README.md
```

---

## 🎯 Demo Flow (Hackathon)

1. Student opens app → picks role + duration
2. Enters fake workspace (Slack + Tasks + Docs)
3. Manager sends welcome message
4. Tech lead drops docs link
5. Student has to communicate, update tasks, attend meeting
6. If silent → escalation from manager
7. End session → behavioral score + report

**That's the demo. Simple. Powerful. Unforgettable.**
