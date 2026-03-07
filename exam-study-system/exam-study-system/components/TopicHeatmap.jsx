"use client";

import { aggregateTopics, calculateAccuracy } from "../lib/session-utils";
import { SUBJECTS } from "../lib/subjects";

export default function TopicHeatmap({ subject, sessions }) {
  const config = SUBJECTS[subject];
  const aggregate = aggregateTopics(sessions, subject);
  const maxAttempted = Math.max(...Object.values(aggregate).map((value) => value.attempted), 1);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-1 text-[11px] uppercase tracking-[0.22em] text-zinc-500">Topic Coverage</div>
      <div className="mb-5 text-xs text-zinc-600">Questions attempted and blended accuracy per topic.</div>
      <div className="space-y-4">
        {config.topics
          .filter((topic) => topic !== "Other")
          .map((topic) => {
            const stats = aggregate[topic] || { attempted: 0, correct: 0, partial: 0, wrong: 0 };
            const coverage = Math.round((stats.attempted / maxAttempted) * 100);
            const accuracy = calculateAccuracy(stats.correct, stats.partial, stats.attempted);
            const empty = stats.attempted === 0;
            const color = config.topicColors[topic] || "#777777";

            return (
              <div key={topic} className="grid gap-2 sm:grid-cols-[minmax(0,160px)_1fr_auto] sm:items-center">
                <div className={`text-sm ${empty ? "text-zinc-600" : "text-zinc-200"}`}>{topic}</div>
                <div className="relative h-4 overflow-hidden rounded-full bg-[#1a1a1a]">
                  {!empty ? (
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${coverage}%`, backgroundColor: `${color}55` }}>
                      <div className="h-full rounded-full" style={{ width: `${accuracy}%`, backgroundColor: color }} />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center px-3 text-[10px] uppercase tracking-[0.2em] text-zinc-700">
                      not studied
                    </div>
                  )}
                </div>
                <div className="text-right font-mono text-xs text-zinc-400">
                  {stats.attempted ? `${stats.attempted}Q / ${accuracy}%` : "0Q"}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
