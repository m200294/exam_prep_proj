"use client";

import { SUBJECTS } from "../lib/subjects";

export default function AppHeader({ activeTab, onTabChange, onAddSession }) {
  const tabs = [{ id: "overview", label: "Overview" }].concat(
    Object.keys(SUBJECTS).map((subject) => ({ id: subject, label: subject }))
  );

  return (
    <header className="border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-4 pt-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-[-0.03em] text-white sm:text-2xl">Exam Study System</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">MATH101 | PHYS201 | CHEM150 | June 2026</p>
          </div>
          <button
            type="button"
            onClick={onAddSession}
            className="rounded-xl bg-accent-teal px-4 py-3 text-sm font-bold text-black transition hover:brightness-105"
          >
            + Add Session
          </button>
        </div>

        <nav className="-mx-1 overflow-x-auto px-1">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const accent = tab.id === "overview" ? "#ffffff" : SUBJECTS[tab.id].accent;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    active ? "text-black" : "bg-transparent text-zinc-500 hover:text-zinc-200"
                  }`}
                  style={active ? { backgroundColor: accent } : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
