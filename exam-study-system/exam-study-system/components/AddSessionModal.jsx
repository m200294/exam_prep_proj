"use client";

import { useEffect, useMemo, useState } from "react";
import { SUBJECTS } from "../lib/subjects";

function textList(value) {
  return value?.length ? value.join(", ") : "";
}

function buildTopicBreakdown(topics, attempted, correct, partial, wrong) {
  if (!topics.length || !attempted) {
    return null;
  }

  const topicCount = topics.length;
  const base = {
    attempted: Math.floor(attempted / topicCount),
    correct: Math.floor(correct / topicCount),
    partial: Math.floor(partial / topicCount),
    wrong: Math.floor(wrong / topicCount),
  };
  const remainder = {
    attempted: attempted - base.attempted * topicCount,
    correct: correct - base.correct * topicCount,
    partial: partial - base.partial * topicCount,
    wrong: wrong - base.wrong * topicCount,
  };

  return topics.reduce((accumulator, topic, index) => {
    accumulator[topic] = {
      attempted: base.attempted + (index < remainder.attempted ? 1 : 0),
      correct: base.correct + (index < remainder.correct ? 1 : 0),
      partial: base.partial + (index < remainder.partial ? 1 : 0),
      wrong: base.wrong + (index < remainder.wrong ? 1 : 0),
    };
    return accumulator;
  }, {});
}

export default function AddSessionModal({ onClose, onAdd, onUpdate, editSession = null }) {
  const editMode = Boolean(editSession);
  const [mode, setMode] = useState(editMode ? "form" : "json");
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("MATH");
  const [type, setType] = useState("exam_practice");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [attempted, setAttempted] = useState("");
  const [correct, setCorrect] = useState("");
  const [partial, setPartial] = useState("");
  const [wrong, setWrong] = useState("");
  const [estimatedMarks, setEstimatedMarks] = useState("");
  const [weakAreas, setWeakAreas] = useState("");
  const [nextSession, setNextSession] = useState("");
  const [durationMins, setDurationMins] = useState("");
  const [bloomLevel, setBloomLevel] = useState("");
  const [conceptsEncoded, setConceptsEncoded] = useState("");

  useEffect(() => {
    if (!editSession) {
      return;
    }

    setMode("form");
    setSubject(editSession.subject || "MATH");
    setType(editSession.type || "exam_practice");
    setSelectedTopics(editSession.topics || []);
    setAttempted(editSession.attempted?.toString() || "");
    setCorrect(editSession.correct?.toString() || "");
    setPartial(editSession.partial?.toString() || "");
    setWrong(editSession.wrong?.toString() || "");
    setEstimatedMarks(editSession.estimatedMarks || "");
    setWeakAreas(textList(editSession.weakAreas || []));
    setNextSession(editSession.nextSession || "");
    setDurationMins(editSession.duration_mins?.toString() || "");
    setBloomLevel(editSession.bloom_level_reached?.toString() || "");
    setConceptsEncoded(textList(editSession.concepts_encoded || []));
  }, [editSession]);

  const subjectTopics = useMemo(() => SUBJECTS[subject].topics, [subject]);

  const resetError = () => setError("");

  const handleJsonSubmit = async () => {
    resetError();
    setLoading(true);

    try {
      const parsed = JSON.parse(jsonText);
      const sessions = Array.isArray(parsed) ? parsed : [parsed];

      for (const session of sessions) {
        if (!session.subject || !SUBJECTS[session.subject]) {
          throw new Error(`Invalid or missing subject: ${session.subject}. Must be MATH, PHYS, or CHEM.`);
        }

        await onAdd(session);
      }

      onClose();
    } catch (caughtError) {
      setError(caughtError.message);
    }

    setLoading(false);
  };

  const handleFormSubmit = async () => {
    resetError();
    setLoading(true);

    try {
      const examAttempted = parseInt(attempted, 10) || 0;
      const examCorrect = parseInt(correct, 10) || 0;
      const examPartial = parseInt(partial, 10) || 0;
      const examWrong = parseInt(wrong, 10) || 0;
      const sessionData = {
        subject,
        type,
        topics: selectedTopics,
        timestamp: editSession?.timestamp || new Date().toISOString(),
        weakAreas: weakAreas
          ? weakAreas
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
          : [],
        nextSession: nextSession || null,
      };

      if (type === "exam_practice") {
        sessionData.attempted = examAttempted;
        sessionData.correct = examCorrect;
        sessionData.partial = examPartial;
        sessionData.wrong = examWrong;
        sessionData.estimatedMarks = estimatedMarks || null;
        sessionData.topicBreakdown = buildTopicBreakdown(
          selectedTopics,
          examAttempted,
          examCorrect,
          examPartial,
          examWrong
        );
      } else {
        sessionData.duration_mins = parseInt(durationMins, 10) || null;
        sessionData.bloom_level_reached = parseInt(bloomLevel, 10) || null;
        sessionData.concepts_encoded = conceptsEncoded
          ? conceptsEncoded
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
          : [];
      }

      if (editMode) {
        await onUpdate(editSession.id, sessionData);
      } else {
        await onAdd(sessionData);
      }

      onClose();
    } catch (caughtError) {
      setError(caughtError.message);
    }

    setLoading(false);
  };

  const toggleTopic = (topic) => {
    setSelectedTopics((current) => (current.includes(topic) ? current.filter((value) => value !== topic) : [...current, topic]));
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-800 bg-[#1a1a1a] px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-zinc-600";
  const labelClass = "mb-2 block text-[11px] uppercase tracking-[0.18em] text-zinc-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-3xl border border-zinc-800 bg-surface p-6 shadow-2xl shadow-black/50 sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{editMode ? "Edit Session" : "Add Session"}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {editMode ? "Update an existing study log." : "Paste JSON or enter the session details manually."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-zinc-600 transition hover:text-zinc-300">
            x
          </button>
        </div>

        {!editMode ? (
          <div className="mb-6 flex gap-2 rounded-2xl bg-base p-1">
            {[
              ["json", "Paste JSON"],
              ["form", "Use Form"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex-1 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  mode === value ? "bg-[#1a1a1a] text-white" : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        {mode === "json" && !editMode ? (
          <div>
            <label className={labelClass}>Session JSON</label>
            <textarea
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              className={`${inputClass} min-h-[260px] resize-y font-mono text-xs`}
              placeholder={`{\n  "subject": "MATH",\n  "type": "exam_practice",\n  "topics": ["Calculus", "Linear Algebra"],\n  "attempted": 10,\n  "correct": 8,\n  "partial": 1,\n  "wrong": 1,\n  "estimatedMarks": "30/40"\n}`}
            />
            <button
              type="button"
              onClick={handleJsonSubmit}
              disabled={loading || !jsonText.trim()}
              className="mt-4 w-full rounded-xl bg-accent-teal px-4 py-3 text-sm font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Session"}
            </button>
          </div>
        ) : null}

        {mode === "form" ? (
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Subject</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(SUBJECTS).map((value) => {
                  const active = subject === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setSubject(value);
                        setSelectedTopics((current) => current.filter((topic) => SUBJECTS[value].topics.includes(topic)));
                      }}
                      className="rounded-xl border px-3 py-3 text-sm font-semibold transition"
                      style={{
                        borderColor: active ? `${SUBJECTS[value].accent}55` : "#333333",
                        color: active ? SUBJECTS[value].accent : "#6b7280",
                        backgroundColor: active ? `${SUBJECTS[value].accent}14` : "#1a1a1a",
                      }}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>Session Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["exam_practice", "Exam Practice"],
                  ["deep_encoding", "Deep Encoding"],
                ].map(([value, label]) => {
                  const active = type === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        active ? "border-zinc-500 bg-white/8 text-white" : "border-zinc-800 bg-[#1a1a1a] text-zinc-500"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>Topics Covered</label>
              <div className="flex flex-wrap gap-2">
                {subjectTopics.map((topic) => {
                  const active = selectedTopics.includes(topic);
                  const color = SUBJECTS[subject].topicColors[topic] || "#777777";
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className="rounded-full border px-3 py-2 text-xs font-semibold transition"
                      style={{
                        borderColor: active ? `${color}55` : "#333333",
                        color: active ? color : "#6b7280",
                        backgroundColor: active ? `${color}14` : "#141414",
                      }}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {type === "exam_practice" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Attempted", attempted, setAttempted],
                    ["Correct", correct, setCorrect],
                    ["Partial", partial, setPartial],
                    ["Wrong", wrong, setWrong],
                  ].map(([label, value, setter]) => (
                    <div key={label}>
                      <label className={labelClass}>{label}</label>
                      <input
                        type="number"
                        value={value}
                        onChange={(event) => setter(event.target.value)}
                        className={inputClass}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className={labelClass}>Estimated Marks</label>
                  <input
                    value={estimatedMarks}
                    onChange={(event) => setEstimatedMarks(event.target.value)}
                    className={inputClass}
                    placeholder="32/36"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Duration (mins)</label>
                    <input
                      type="number"
                      value={durationMins}
                      onChange={(event) => setDurationMins(event.target.value)}
                      className={inputClass}
                      placeholder="40"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Bloom Level Reached</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={bloomLevel}
                      onChange={(event) => setBloomLevel(event.target.value)}
                      className={inputClass}
                      placeholder="4"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Concepts Encoded</label>
                  <input
                    value={conceptsEncoded}
                    onChange={(event) => setConceptsEncoded(event.target.value)}
                    className={inputClass}
                    placeholder="Concept 1, Concept 2"
                  />
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>Weak Areas</label>
              <input
                value={weakAreas}
                onChange={(event) => setWeakAreas(event.target.value)}
                className={inputClass}
                placeholder="Weak area 1, Weak area 2"
              />
            </div>

            <div>
              <label className={labelClass}>Next Session Priority</label>
              <input
                value={nextSession}
                onChange={(event) => setNextSession(event.target.value)}
                className={inputClass}
                placeholder="What to focus on next"
              />
            </div>

            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={loading}
              className="w-full rounded-xl px-4 py-3 text-sm font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: SUBJECTS[subject].accent }}
            >
              {loading ? (editMode ? "Saving..." : "Adding...") : editMode ? "Save Changes" : "Add Session"}
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-accent-red/25 bg-accent-red/10 px-4 py-3 text-sm text-accent-red">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
