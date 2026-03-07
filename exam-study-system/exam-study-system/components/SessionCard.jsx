"use client";

import { useState } from "react";
import { SUBJECTS } from "../lib/subjects";
import { calculateAccuracy } from "../lib/session-utils";

function ScorePill({ children, colorClass }) {
  return <span className={`font-mono text-xs ${colorClass}`}>{children}</span>;
}

export default function SessionCard({ session, subject, index, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const config = SUBJECTS[subject];
  const isEncoding = session.type === "deep_encoding";
  const totalQuestions = session.attempted || 0;
  const accuracy = calculateAccuracy(session.correct, session.partial, totalQuestions);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.02] sm:px-5"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ borderColor: `${config.accent}44`, color: config.accent, backgroundColor: `${config.accent}14` }}
            >
              Session {index + 1}
            </span>
            <span className="text-sm font-semibold text-zinc-100">
              {isEncoding ? "Deep Encoding" : "Exam Practice"}
            </span>
            {!isEncoding && (
              <span className={`text-sm font-semibold ${accuracy >= 70 ? "text-accent-teal" : accuracy >= 50 ? "text-accent-yellow" : "text-accent-red"}`}>
                {accuracy}%
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-500">
            {new Date(session.timestamp).toLocaleString()}
            {isEncoding
              ? ` | ${session.duration_mins || "?"} min | Bloom L${session.bloom_level_reached || "?"}`
              : ` | ${totalQuestions} Qs | ${session.estimatedMarks || "No mark estimate"}`}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isEncoding && (
            <div className="hidden items-center gap-3 sm:flex">
              <ScorePill colorClass="text-accent-teal">+{session.correct || 0}</ScorePill>
              <ScorePill colorClass="text-accent-yellow">~{session.partial || 0}</ScorePill>
              <ScorePill colorClass="text-accent-red">-{session.wrong || 0}</ScorePill>
            </div>
          )}
          <span className="text-sm text-zinc-600">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-4 sm:px-5">
          {isEncoding && session.concepts_encoded?.length ? (
            <section className="mb-4">
              <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500">Concepts Encoded</div>
              <div className="flex flex-wrap gap-2">
                {session.concepts_encoded.map((concept) => (
                  <span
                    key={concept}
                    className="rounded-lg border border-accent-green/20 bg-accent-green/10 px-3 py-1 text-xs text-accent-green"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {session.topicBreakdown && Object.keys(session.topicBreakdown).length ? (
            <section className="mb-4">
              <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500">Topic Breakdown</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(session.topicBreakdown).map(([topic, value]) => {
                  const topicAccuracy = calculateAccuracy(value.correct, value.partial || 0, value.attempted || 0);
                  const color = config.topicColors[topic] || "#777777";
                  return (
                    <div
                      key={topic}
                      className="rounded-lg border px-3 py-2 text-xs"
                      style={{ borderColor: `${color}44`, backgroundColor: `${color}14` }}
                    >
                      <div style={{ color }} className="font-semibold">
                        {topic}
                      </div>
                      <div className="mt-1 font-mono text-zinc-300">
                        {value.attempted || 0}Q | {topicAccuracy}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {session.weakAreas?.length ? (
            <section className="mb-4">
              <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500">Weak Areas</div>
              <div className="space-y-2">
                {session.weakAreas.map((area) => (
                  <div key={area} className="text-sm text-zinc-300">
                    ! {area}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {session.nextSession ? (
            <section className="mb-4 rounded-xl border border-accent-green/25 bg-accent-green/10 p-3">
              <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-accent-green/80">Next Session Priority</div>
              <div className="text-sm text-accent-green">{session.nextSession}</div>
            </section>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(session);
              }}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (window.confirm("Delete this session?")) {
                  onDelete(session.id);
                }
              }}
              className="rounded-lg border border-accent-red/25 bg-accent-red/10 px-3 py-2 text-xs font-semibold text-accent-red transition-colors hover:border-accent-red/40 hover:bg-accent-red/15"
            >
              Delete Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
