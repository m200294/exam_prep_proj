# Exam Study System

An AI-powered exam preparation system built with Claude, Next.js, Supabase, and Vercel. Tracks study sessions, topic coverage, recurring weak areas, and cumulative accuracy — with Claude saving sessions automatically.

---

## Origins
Built for 3 university final exams ((Algorithms & Data Structures II, How Computers Work, Programming with Data)) over a 3-week sprint in March 2026. No tracking existed between sessions — progress was invisible. Each component was added to fix a specific gap: tracker first, then coach, then MCP automation.

---

## How It Works

The system has four parts: **skills**, **tracker**, **coach**, and **MCP automation**. They form a closed loop.

### 1. Skills (Claude Project Skills)

One generalized instruction file that lives inside a Claude project. It tells Claude exactly how to run each type of study session — exam drills, concept encoding, and progress coaching — across any subject.

- **General exam-practice skill** — Covers all subjects. Generates structured practice questions, allocates marks, diagnoses weak areas, and saves session results automatically.
- **Deep encoding skill** — Guided concept learning sessions using the Layers of Learning framework (Justin Sung) and Bloom's Revised Taxonomy. Not a lecture — a structured dialogue where you build understanding layer by layer: Logic → Concepts → Important Details → Arbitrary Details. Claude prompts, you fill in the gaps. Sessions are tracked and saved like any other session type.

### 2. Tracker (This Web App)

A live dashboard that visualises all study session data. Shows per-subject stats, topic coverage heatmaps, accuracy breakdowns, progress charts, recurring weak areas, and days until each exam.

### 3. Coach

When you say "coach check" in any chat, Claude fetches your live session data from Supabase, computes metrics across all subjects, and generates a report. It flags stalled subjects, identifies undertrained topics, predicts where you'll be on exam day at your current pace, and tells you exactly what to study next.

### 4. MCP Automation

An MCP server registered in Claude Desktop that exposes a `save_study_session` tool. At the end of every study session, Claude calls this tool to save results directly to the tracker — no manual JSON copying or pasting required.

### The Loop

```
Study with Claude → Claude auto-saves session via MCP → tracker updates → coach reads tracker → tells you what to study next → repeat
```

No manual file management. No copy-pasting JSON. No data loss between chats.

---

## Stack

- **Frontend**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS v3
- **Database**: Supabase (Postgres)
- **Hosting**: Vercel (free tier)
- **AI**: Claude Desktop with custom project skill + MCP
- **Charts**: Recharts (progress over time)
- **Notifications**: react-hot-toast
- **Cost**: $0 (all free tiers)

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

1. In Supabase → **Settings** (gear icon) → **API**
2. Copy the **Project URL** (looks like `https://xyz.supabase.co`)
3. Copy the **anon public** key (long string starting with `eyJ...`)

### 4. Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → Sign up → **Import** your repo
3. Add **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `SESSION_API_KEY` = a random secret (generate with `openssl rand -hex 32`)
4. Set **Framework Preset** to Next.js
5. Click **Deploy** — live URL in ~60 seconds

### 5. Configure the Local Environment (optional)

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase keys
npm run dev
```

### 6. Set Up Claude Desktop MCP

1. Install MCP server dependencies:
   ```bash
   cd mcp-server
   npm install
   ```

2. Open your Claude Desktop config file:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

3. Add the MCP server entry:
   ```json
   {
     "mcpServers": {
       "exam-study-system": {
         "command": "node",
         "args": ["/absolute/path/to/exam-study-system/mcp-server/index.js"],
         "env": {
           "TRACKER_API_URL": "https://your-app.vercel.app/api/sessions",
           "TRACKER_API_KEY": "your-SESSION_API_KEY-value"
         }
       }
     }
   }
   ```

4. Restart Claude Desktop — you should see "exam-study-system" in the MCP tools list.

### 7. Set Up Claude Project

1. Create a Claude project
2. Add `skills folder/general-exam-practice-SKILL.md` to the project's custom skills
3. Update the skill to say: "Use the `save_study_session` tool to save session results automatically"
4. Start studying

---

## Usage

### Adding Sessions

Three ways to add sessions:

- **Automatic (MCP)**: Claude calls `save_study_session` at the end of a study session. No action needed from you.
- **Paste JSON**: Click `+ Add Session` → **Paste JSON** tab → paste Claude's output → Add.
- **Manual form**: Click `+ Add Session` → **Use Form** tab → fill in fields.

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

```
exam-study-system/
├── app/
│   ├── api/
│   │   └── sessions/
│   │       └── route.js          # POST endpoint for automated session saving
│   ├── layout.js                 # Root layout with Toaster provider
│   ├── page.js                   # Entry point
│   └── globals.css               # Tailwind directives + base styles
├── components/                   # Refactored UI components
├── lib/                          # Subjects config, Supabase client, helpers
├── mcp-server/                   # Claude Desktop MCP server
├── supabase-schema.sql           # Run once in Supabase SQL Editor
├── .env.local.example            # Template for env vars
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Adapting This for Your Own Exams (check out the my-study-tracker repo for my personal template)

This system isn't specific to these 3 subjects. To adapt it:

1. **Edit the `SUBJECTS` config** in `lib/subjects.js` — change names, topics, exam dates, colours
2. **Update the skill file** — swap in your exam context, topic priorities, and question focus areas
3. **Update the SQL schema** — change the `CHECK` constraint on the `subject` column to match your subjects
4. **Update the API route** — update the valid subjects list in `app/api/sessions/route.js`
5. **Update the MCP server** — update the subject enum in `mcp-server/index.js`

The core loop (skill → session → tracker → coach → repeat) works for any exam-based studying.
