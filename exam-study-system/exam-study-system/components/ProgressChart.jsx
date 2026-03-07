"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SUBJECTS } from "../lib/subjects";

function buildChartData(allSessions) {
  const totals = {};
  const pointsByDate = new Map();

  const sortedSessions = Object.entries(allSessions)
    .flatMap(([subject, sessions]) =>
      sessions
        .filter((session) => session.type !== "deep_encoding")
        .map((session) => ({ ...session, subject }))
    )
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  sortedSessions.forEach((session) => {
    if (!totals[session.subject]) {
      totals[session.subject] = { correct: 0, partial: 0, attempted: 0 };
    }

    totals[session.subject].correct += session.correct || 0;
    totals[session.subject].partial += session.partial || 0;
    totals[session.subject].attempted += session.attempted || 0;

    const isoDate = new Date(session.timestamp).toISOString().slice(0, 10);
    const point =
      pointsByDate.get(isoDate) ||
      {
        isoDate,
        date: new Date(session.timestamp).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
      };

    Object.keys(totals).forEach((subject) => {
      const current = totals[subject];
      point[subject] =
        current.attempted > 0
          ? Math.round(((current.correct + current.partial * 0.5) / current.attempted) * 100)
          : null;
    });

    pointsByDate.set(isoDate, point);
  });

  const orderedPoints = Array.from(pointsByDate.values()).sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const lastSeen = {};

  return orderedPoints.map((point) => {
    const nextPoint = { date: point.date };

    Object.keys(SUBJECTS).forEach((subject) => {
      if (point[subject] != null) {
        lastSeen[subject] = point[subject];
      }
      nextPoint[subject] = lastSeen[subject] ?? null;
    });

    return nextPoint;
  });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-[#0f0f0f]/95 p-3 text-xs shadow-2xl shadow-black/40">
      <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="font-semibold" style={{ color: entry.color }}>
              {entry.dataKey}
            </span>
            <span className="font-semibold text-zinc-100">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProgressChart({ allSessions }) {
  const data = buildChartData(allSessions);
  const examPracticeCount = Object.values(allSessions).reduce(
    (count, sessions) => count + sessions.filter((session) => session.type !== "deep_encoding").length,
    0
  );

  if (examPracticeCount < 2) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-zinc-500">
        Complete a few practice sessions to see your progress trend.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">Accuracy Over Time</h3>
        <p className="text-xs text-zinc-500">Cumulative accuracy across exam practice sessions.</p>
      </div>
      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#242424" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#7a7a7a", fontSize: 11 }}
              axisLine={{ stroke: "#242424" }}
              tickLine={{ stroke: "#242424" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#7a7a7a", fontSize: 11 }}
              axisLine={{ stroke: "#242424" }}
              tickLine={{ stroke: "#242424" }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px", color: "#d4d4d8" }} />
            {Object.entries(SUBJECTS).map(([subject, config]) => (
              <Line
                key={subject}
                type="monotone"
                dataKey={subject}
                stroke={config.accent}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 0, fill: config.accent }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
