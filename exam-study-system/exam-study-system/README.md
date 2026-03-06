# Exam Study System

An AI-powered exam preparation system built with Claude, Next.js, Supabase, and Vercel. Designed for structured, data-driven studying with real-time progress tracking and honest performance assessment.

Built for 3 university exams (Algorithms & Data Structures II, How Computers Work, Programming with Data) over a 3-week sprint in March 2026.

---

## How It Works

The system has three parts: **skills**, **tracker**, and **coach**. They form a closed loop.

### 1. Skills (Claude Project Skills)

Five custom instruction files that live inside a Claude project. They tell Claude exactly how to run each type of study session:

- **ads2-exam-practice** — Drills past paper questions for Algorithms & Data Structures II. Real exam questions with structured feedback, mark allocation, and weak area diagnosis.
- **pwd-exam-practice** — Same format for Programming with Data. Covers SQL, data types, web scraping, visualisation, EDA.
- **hcw-exam-practice** — Generates fresh exam-style questions on the fly for How Computers Work. MCQs, long answers, and 16-mark scenario questions.
- **deep-encoding** — Guided concept learning sessions using Justin Sung's Layers of Learning and Bloom's Revised Taxonomy. Not a lecture — a structured dialogue where the student builds understanding layer by layer.
- **study-coach** — Fetches live session data from the database and generates a brutally honest progress report: pace, accuracy trends, topic coverage gaps, risk scores, trajectory predictions, and a specific 3-day action plan.

### 2. Tracker (This Web App)

A live dashboard that visualises all study session data. Shows per-subject stats, topic coverage heatmaps, accuracy breakdowns, recurring weak areas, and days until each exam.

At the end of every study session, Claude outputs a JSON block. You paste it into the tracker via the "+ Add Session" button. The data saves to a Postgres database and persists forever — accessible from any device.

### 3. Coach

When you say "coach check" in any chat, Claude fetches your live session data from Supabase, computes metrics across all subjects, and generates a report. It flags stalled subjects, identifies undertrained topics, predicts where you'll be on exam day at your current pace, and tells you exactly what to study next.

### The Loop

```
Study with Claude → paste session JSON into tracker → coach reads tracker → tells you what to study next → repeat
```

No manual file management. No re-rendering artifacts. No data loss between chats.

---

## Stack

- **Frontend**: Next.js (React)
- **Database**: Supabase (Postgres)
- **Hosting**: Vercel (free tier)
- **AI**: Claude with custom project skills
- **Cost**: $0 (all free tiers)

---

## Setup (15 minutes)

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
4. Set **Root Directory** to the folder containing `package.json` if nested
5. Set **Framework Preset** to Next.js
6. Click **Deploy** — live URL in ~60 seconds

### 5. Set Up Claude Project

1. Create a Claude project
2. Add the 5 skill files to the project's custom skills
3. Paste the project instructions (includes Supabase connection details)
4. Start studying

### Alternative: Run Locally

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase keys
npm run dev
```

---

## Usage

### Adding Sessions

- **From Claude**: After a practice session, Claude outputs session JSON. Copy it.
- **In the tracker**: Click `+ Add Session` → **Paste JSON** tab → paste → Add.
- **Manual entry**: Click `+ Add Session` → **Use Form** tab → fill in fields.

### Session JSON Format

Exam practice:
```json
{
  "subject": "ADS2",
  "type": "exam_practice",
  "topics": ["BST", "Graphs"],
  "attempted": 10,
  "correct": 8,
  "partial": 1,
  "wrong": 1,
  "estimated_marks": "30/40",
  "weak_areas": ["BST deletion edge cases"],
  "next_session": "Graph traversal algorithms",
  "topic_breakdown": {
    "BST": { "attempted": 6, "correct": 5, "partial": 0, "wrong": 1 },
    "Graphs": { "attempted": 4, "correct": 3, "partial": 1, "wrong": 0 }
  }
}
```

Deep encoding:
```json
{
  "subject": "PWD",
  "type": "deep_encoding",
  "topics": ["SQL"],
  "duration_mins": 40,
  "bloom_level_reached": 4,
  "concepts_encoded": ["Joins", "Subqueries", "Aggregation"],
  "weak_areas": ["Complex JOINs"],
  "next_session": "Practice SQL exam questions"
}
```

---

## File Structure

```
study-tracker-app/
├── app/
│   ├── layout.js            # Root layout
│   ├── page.js              # Entry point
│   └── globals.css           # Base styles
├── components/
│   └── StudyTracker.jsx      # Main UI (all components)
├── lib/
│   └── supabase.js           # DB client + CRUD operations
├── supabase-schema.sql       # Run once in Supabase SQL Editor
├── .env.local.example        # Template for env vars
├── next.config.js
└── package.json
```

---

## Adapting This for Your Own Exams

This system isn't specific to these 3 subjects. To adapt it:

1. **Edit the `SUBJECTS` config** in `StudyTracker.jsx` — change names, topics, exam dates, colours
2. **Write your own skill files** — use the existing ones as templates. The structure is: exam context → topic priority → question bank → feedback protocol → session save format
3. **Update the SQL schema** — change the `CHECK` constraint on the `subject` column to match your subjects
4. **Update project instructions** — paste your Supabase keys and subject list

The core loop (skill → session → tracker → coach → repeat) works for any exam-based studying.
