"use client";

import { useState } from "react";
import SessionCard from "./SessionCard";
import TopicHeatmap from "./TopicHeatmap";
import { calculateAccuracy, getSessionTotals, getWeakAreaCounts } from "../lib/session-utils";
import { daysUntil, SUBJECTS } from "../lib/subjects";

function StatBox({ label, value, subtext, valueClass = "text-zinc-100", accent }) {
  return (
    <div
      className="min-w-[120px] rounded-2xl border bg-surface px-4 py-4"
      style={{ borderColor: accent ? `${accent}33` : "#242424", boxShadow: accent ? `inset 3px 0 0 0 ${accent}` : undefined }}
    >
      <div className={`font-mono text-2xl font-bold ${valueClass}`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      {subtext ? <div className="mt-1 text-[11px] text-zinc-600">{subtext}</div> : null}
    </div>
  );
}

export default function SubjectDashboard({ subject, sessions, onDelete, onEdit }) {
  const [activePanel, setActivePanel] = useState("dashboard");
  const config = SUBJECTS[subject];
  const totals = getSessionTotals(sessions);
  const accuracy = calculateAccuracy(totals.correct, totals.partial, totals.attempted);
  const examDays = daysUntil(config.examDate);
  const weakAreas = getWeakAreaCounts(sessions).slice(0, 5);
  const latestNextSession = [...sessions].reverse().find((session) => session.nextSession)?.nextSession;

  const tabs = [
    { id: "dashboard", label: "Overview" },
    { id: "coverage", label: "Topic Coverage" },
    { id: "log", label: `Log (${sessions.length})` },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-lg font-bold text-zinc-100">
              {config.code} | {config.fullName}
            </div>
            <div className="mt-2 text-sm text-zinc-500">
              Exam on{" "}
              {new Date(config.examDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="text-left lg:text-right">
            <div
              className={`font-mono text-4xl font-bold ${examDays <= 7 ? "text-accent-red" : ""}`}
              style={examDays > 7 ? { color: config.accent } : undefined}
            >
              {examDays}
            </div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">days left</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-2">
          {tabs.map((tab) => {
            const active = activePanel === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePanel(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  active ? "text-black" : "bg-transparent text-zinc-500 hover:text-zinc-200"
                }`}
                style={active ? { backgroundColor: config.accent } : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activePanel === "dashboard" ? (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap gap-3">
              <StatBox label="Sessions" value={sessions.length} accent={config.accent} />
              <StatBox label="Questions" value={totals.attempted} valueClass="text-zinc-200" />
              <StatBox
                label="Correct"
                value={totals.correct}
                subtext={`${totals.attempted ? Math.round((totals.correct / totals.attempted) * 100) : 0}% raw`}
                valueClass="text-accent-teal"
              />
              <StatBox label="Partial" value={totals.partial} valueClass="text-accent-yellow" />
              <StatBox label="Wrong" value={totals.wrong} valueClass="text-accent-red" />
              <StatBox
                label="Score"
                value={`${accuracy}%`}
                valueClass={accuracy >= 70 ? "text-accent-teal" : accuracy >= 50 ? "text-accent-yellow" : "text-accent-red"}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-2xl border border-border bg-base p-5">
                <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-zinc-500">Recurring Weak Areas</div>
                {weakAreas.length ? (
                  <div className="space-y-3">
                    {weakAreas.map(([area, count]) => (
                      <div key={area} className="flex items-center justify-between gap-4">
                        <div className="text-sm text-zinc-300">! {area}</div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                            count >= 3
                              ? "border-accent-red/30 bg-accent-red/10 text-accent-red"
                              : "border-accent-orange/30 bg-accent-orange/10 text-accent-orange"
                          }`}
                        >
                          x{count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">None flagged yet.</div>
                )}
              </section>

              <section className="rounded-2xl border border-accent-green/25 bg-accent-green/10 p-5">
                <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-accent-green/80">Recommended Next</div>
                <div className="text-sm text-accent-green">
                  {latestNextSession || "No follow-up priority recorded yet."}
                </div>
              </section>
            </div>
          </div>
        ) : null}

        {activePanel === "coverage" ? <div className="mt-6"><TopicHeatmap subject={subject} sessions={sessions} /></div> : null}

        {activePanel === "log" ? (
          <div className="mt-6">
            {sessions.length ? (
              <div className="space-y-4">
                {[...sessions].reverse().map((session, reverseIndex) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    subject={subject}
                    index={sessions.length - reverseIndex - 1}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-zinc-500">No sessions yet.</div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
