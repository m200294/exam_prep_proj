"use client";

import ProgressChart from "./ProgressChart";
import { aggregateTopics, calculateAccuracy, getSessionTotals } from "../lib/session-utils";
import { daysUntil, SUBJECTS } from "../lib/subjects";

export default function OverviewPanel({ allSessions }) {
  const subjects = Object.keys(SUBJECTS);
  const recentWeakAreas = subjects
    .flatMap((subject) =>
      (allSessions[subject] || [])
        .slice(-2)
        .flatMap((session) => (session.weakAreas || []).map((area) => ({ area, subject })))
    )
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {subjects.map((subject) => {
          const sessions = allSessions[subject] || [];
          const totals = getSessionTotals(sessions);
          const accuracy = calculateAccuracy(totals.correct, totals.partial, totals.attempted);
          const accent = SUBJECTS[subject].accent;
          const examDays = daysUntil(SUBJECTS[subject].examDate);
          const topicStats = aggregateTopics(sessions, subject);
          const topics = SUBJECTS[subject].topics.filter((topic) => topic !== "Other");
          const studied = topics.filter((topic) => (topicStats[topic]?.attempted || 0) > 0).length;
          const coverage = Math.round((studied / topics.length) * 100);

          return (
            <section
              key={subject}
              className="rounded-2xl border bg-surface p-5"
              style={{ borderColor: `${accent}33`, boxShadow: `inset 0 2px 0 0 ${accent}` }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold" style={{ color: accent }}>
                    {SUBJECTS[subject].label}
                  </div>
                  <div className="text-xs text-zinc-500">{SUBJECTS[subject].code}</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-2xl font-bold ${examDays <= 7 ? "text-accent-red" : ""}`} style={examDays > 7 ? { color: accent } : undefined}>
                    {examDays}d
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">to exam</div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2">
                {[
                  {
                    label: "score",
                    value: `${accuracy}%`,
                    color:
                      accuracy >= 70 ? "text-accent-teal" : accuracy >= 50 ? "text-accent-yellow" : accuracy > 0 ? "text-accent-red" : "text-zinc-600",
                  },
                  { label: "sessions", value: sessions.length, color: "text-zinc-200" },
                  { label: "questions", value: totals.attempted, color: "text-zinc-400" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-base px-2 py-3 text-center">
                    <div className={`font-mono text-lg font-bold ${item.color}`}>{item.value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-600">{item.label}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  <span>Topic coverage</span>
                  <span className={coverage === 100 ? "text-accent-teal" : coverage > 50 ? "text-accent-yellow" : "text-accent-red"}>
                    {studied}/{topics.length} topics
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${coverage}%`, backgroundColor: accent }} />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <ProgressChart allSessions={allSessions} />

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-zinc-500">Recent Weak Areas</div>
        {recentWeakAreas.length ? (
          <div className="space-y-3">
            {recentWeakAreas.map(({ area, subject }, index) => (
              <div key={`${subject}-${area}-${index}`} className="flex items-center gap-3">
                <span
                  className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    borderColor: `${SUBJECTS[subject].accent}44`,
                    color: SUBJECTS[subject].accent,
                    backgroundColor: `${SUBJECTS[subject].accent}14`,
                  }}
                >
                  {subject}
                </span>
                <span className="text-sm text-zinc-300">! {area}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-zinc-500">No sessions yet. Add study logs to surface weak areas.</div>
        )}
      </section>
    </div>
  );
}
