# Exam Study System

An exam-prep dashboard built with Next.js, Supabase, Tailwind, Recharts, and an MCP server for Claude Desktop. It tracks study sessions, topic coverage, recurring weak areas, cumulative accuracy, and lets Claude save sessions directly through an API route instead of manual JSON copy-paste.

This project is currently configured for three subjects:
- `MATH` — Mathematics (`MATH101`)
- `PHYS` — Physics (`PHYS201`)
- `CHEM` — Chemistry (`CHEM150`)

---

## What It Includes

- Responsive study dashboard with overview cards, subject dashboards, topic heatmaps, session logs, and a progress-over-time chart
- Add/edit/delete session flow with toast notifications
- `/api/sessions` POST endpoint for automated inserts
- Claude Desktop MCP server exposing `save_study_session`
- One generalized exam-practice skill instead of separate subject-specific skill files
- Supabase-backed persistence

---

## Stack

- Frontend: Next.js 14, React 18, Tailwind CSS 3
- Database: Supabase (Postgres)
- Charts: Recharts
- Notifications: react-hot-toast
- Automation: MCP server via `@modelcontextprotocol/sdk`

---

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click **New Project** → pick a name and password → Create
3. Wait ~2 min for it to spin up

### 2. Create the Database Table

1. In your Supabase dashboard → **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` and paste it in
4. Click **Run** — you should see "Success"

### 3. Get Your API Keys

1. In Supabase → **Settings** (gear icon) → **General** and **API**
2. Copy the **Project URL** (looks like `https://Project ID.supabase.co`, you'll copy paste your actual project id in place of the Project ID name holder )
3. Copy the **anon public** key (long string starting with `eyJ...`)

### 4. Configure Local Env

```bash
npm install
cp .env.local.example .env.local
```

Then set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SESSION_API_KEY` (optional, but recommended if you plan to expose `/api/sessions`)

### 5. Run Locally

```bash
npm run dev
```

### 6. Deploy to Vercel

1. Push this folder to GitHub
2. Import the repo into Vercel
3. Set these env vars in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SESSION_API_KEY` if you want API protection
4. Deploy

### 7. Configure Claude Desktop MCP

Install the MCP server dependencies:

```bash
cd mcp-server
npm install
```

Then add a Claude Desktop config entry like this:

```json
{
  "mcpServers": {
    "exam-study-system": {
      "command": "node",
      "args": ["/absolute/path/to/exam-study-system/mcp-server/index.js"],
      "env": {
        "TRACKER_API_URL": "https://your-app.vercel.app/api/sessions",
        "TRACKER_API_KEY": "your-session-api-key"
      }
    }
  }
}
```

### 8. Use the Generalized Skill

The repo now includes a single generalized skill source at `skills folder/general-exam-practice-SKILL.md`.
Use it as the exam-practice instruction file instead of maintaining separate per-subject skills.

---

## Usage

### Adding Sessions

- Automated: use `save_study_session` through the MCP server
- Manual JSON: `+ Add Session` → `Paste JSON`
- Manual form: `+ Add Session` → `Use Form`
- Editing: expand a session and click `Edit`

### Session JSON Format

Exam practice:
```json
{
  "subject": "MATH",
  "type": "exam_practice",
  "topics": ["Calculus", "Linear Algebra"],
  "attempted": 10,
  "correct": 8,
  "partial": 1,
  "wrong": 1,
  "estimated_marks": "30/40",
  "weak_areas": ["Integration by parts"],
  "next_session": "Linear algebra mixed drill",
  "topic_breakdown": {
    "Calculus": { "attempted": 6, "correct": 5, "partial": 0, "wrong": 1 },
    "Linear Algebra": { "attempted": 4, "correct": 3, "partial": 1, "wrong": 0 }
  }
}
```

Deep encoding:
```json
{
  "subject": "PHYS",
  "type": "deep_encoding",
  "topics": ["Mechanics"],
  "duration_mins": 40,
  "bloom_level_reached": 4,
  "concepts_encoded": ["Newton's laws", "Free-body diagrams", "Momentum"],
  "weak_areas": ["Projectile decomposition"],
  "next_session": "Practice mechanics exam questions"
}
```

---

## File Structure

```text
exam-study-system/
├── app/
│   ├── api/sessions/route.js # Session POST endpoint
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── components/               # Refactored UI components
├── lib/                      # Subjects config, Supabase, helpers
├── mcp-server/               # Claude Desktop MCP server
├── supabase-schema.sql
├── .env.local.example
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Adapting It

To reuse this for different subjects:

1. Update [lib/subjects.js](/home/m200294/workspace/exam_prep_proj/exam-study-system/exam-study-system/lib/subjects.js)
2. Update `supabase-schema.sql` seed data if needed
3. Update your Claude skill/tooling prompts to emit the right subject/topic names
4. Update the MCP config if the deployed URL or API key changes
