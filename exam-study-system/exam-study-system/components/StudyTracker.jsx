"use client";

import { useState, useEffect } from "react";
import { fetchSessions, addSession, deleteSession, groupBySubject } from "../lib/supabase";

// ═══════════════════════════════════════════════════════
// CUSTOMIZE THIS: Define your subjects, topics, and exam dates
// ═══════════════════════════════════════════════════════
const SUBJECTS = {
  MATH: {
    label: "MATH", fullName: "Mathematics", code: "MATH101",
    examDate: "2026-06-10", accent: "#ff6b35",
    topics: ["Calculus", "Linear Algebra", "Probability", "Statistics", "Other"],
    topicColors: {
      Calculus: "#ff6b35", "Linear Algebra": "#4ecdc4", Probability: "#ffe66d",
      Statistics: "#a8e6cf", Other: "#777",
    },
  },
  PHYS: {
    label: "PHYS", fullName: "Physics", code: "PHYS201",
    examDate: "2026-06-12", accent: "#4ecdc4",
    topics: ["Mechanics", "Electromagnetism", "Thermodynamics", "Optics", "Quantum", "Other"],
    topicColors: {
      Mechanics: "#4ecdc4", Electromagnetism: "#ff6b35", Thermodynamics: "#ffe66d",
      Optics: "#c3b1e1", Quantum: "#a8e6cf", Other: "#777",
    },
  },
  CHEM: {
    label: "CHEM", fullName: "Chemistry", code: "CHEM150",
    examDate: "2026-06-15", accent: "#c3b1e1",
    topics: ["Organic", "Inorganic", "Physical Chemistry", "Biochemistry", "Other"],
    topicColors: {
      Organic: "#c3b1e1", Inorganic: "#ffd3b6", "Physical Chemistry": "#7ec8e3",
      Biochemistry: "#ffe66d", Other: "#777",
    },
  },
};
// ═══════════════════════════════════════════════════════

function daysUntil(d) { return Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000)); }

function aggregateTopics(sessions, subject) {
  const allTopics = SUBJECTS[subject].topics;
  const agg = {};
  allTopics.forEach(t => { agg[t] = { attempted: 0, correct: 0, partial: 0, wrong: 0 }; });
  sessions.forEach(s => {
    if (s.topicBreakdown) {
      Object.entries(s.topicBreakdown).forEach(([t, v]) => {
        if (!agg[t]) agg[t] = { attempted: 0, correct: 0, partial: 0, wrong: 0 };
        agg[t].attempted += v.attempted || 0;
        agg[t].correct += v.correct || 0;
        agg[t].partial += v.partial || 0;
        agg[t].wrong += v.wrong || 0;
      });
    }
  });
  return agg;
}

function StatBox({ label, value, sub, color }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: "14px 18px", minWidth: 100 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</div>
      <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function TopicHeatmap({ subject, sessions }) {
  const subj = SUBJECTS[subject];
  const agg = aggregateTopics(sessions, subject);
  const maxAttempted = Math.max(...Object.values(agg).map(v => v.attempted), 1);

  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 18 }}>
      <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Topic Coverage</div>
      <div style={{ fontSize: 10, color: "#444", marginBottom: 16 }}>Questions attempted + accuracy per topic</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {subj.topics.filter(t => t !== "Other").map(topic => {
          const stats = agg[topic] || { attempted: 0, correct: 0, partial: 0, wrong: 0 };
          const color = subj.topicColors[topic] || "#777";
          const coveragePct = Math.round((stats.attempted / maxAttempted) * 100);
          const accuracyPct = stats.attempted > 0 ? Math.round(((stats.correct + stats.partial * 0.5) / stats.attempted) * 100) : null;
          const isEmpty = stats.attempted === 0;
          return (
            <div key={topic}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <div style={{ width: 140, fontSize: 11, color: isEmpty ? "#444" : "#ccc", flexShrink: 0 }}>{topic}</div>
                <div style={{ flex: 1, height: 18, background: "#1a1a1a", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                  {!isEmpty && (
                    <div style={{ height: "100%", width: `${coveragePct}%`, background: `${color}44`, borderRadius: 4, transition: "width 0.6s ease", position: "relative" }}>
                      {accuracyPct !== null && (
                        <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${accuracyPct}%`, background: color, borderRadius: 4, opacity: 0.8 }} />
                      )}
                    </div>
                  )}
                  {isEmpty && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                      <span style={{ fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: 1 }}>not studied</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10, flexShrink: 0, fontFamily: "monospace", fontSize: 11 }}>
                  <span style={{ color: "#555", minWidth: 50 }}>{isEmpty ? "0 Qs" : `${stats.attempted} Qs`}</span>
                  {!isEmpty && accuracyPct !== null && (
                    <span style={{ color: accuracyPct >= 70 ? "#4ecdc4" : accuracyPct >= 50 ? "#ffe66d" : "#ff6b6b", minWidth: 40 }}>{accuracyPct}%</span>
                  )}
                  {!isEmpty && (
                    <span style={{ color: "#444", fontSize: 10 }}>✓{stats.correct} ~{stats.partial} ✗{stats.wrong}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 16, fontSize: 10, color: "#555" }}>
        <span>Bar width = questions attempted</span>
        <span>Bar fill = accuracy</span>
      </div>
    </div>
  );
}

function SessionCard({ session, index, subject, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const score = (session.correct || 0) + (session.partial || 0) * 0.5;
  const total = session.attempted || 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const accent = SUBJECTS[subject].accent;
  const topicColors = SUBJECTS[subject].topicColors;
  const isEncoding = session.type === "deep_encoding";

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #2a2a2a", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#444"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a2a"}>
      <div onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: isEncoding ? `conic-gradient(#a8e6cf 360deg, #222 0deg)` : `conic-gradient(${accent} ${pct * 3.6}deg, #222 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{isEncoding ? "ENC" : `${pct}%`}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>Session #{index + 1}</span>
            {isEncoding && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "#a8e6cf22", color: "#a8e6cf", border: "1px solid #a8e6cf44" }}>Deep Encoding</span>}
            {(session.topics || []).map(t => (
              <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: (topicColors[t] || "#555") + "22", color: topicColors[t] || "#aaa", border: `1px solid ${(topicColors[t] || "#555")}44` }}>{t}</span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
            {new Date(session.timestamp).toLocaleString()}
            {isEncoding ? ` · ${session.duration_mins || "?"}min · Bloom L${session.bloom_level_reached || "?"}` : ` · ${total} Qs · ${session.estimatedMarks || "?"} marks`}
          </div>
        </div>
        {!isEncoding && (
          <div style={{ display: "flex", gap: 12, fontSize: 12, fontFamily: "monospace" }}>
            <span style={{ color: "#4ecdc4" }}>✓{session.correct}</span>
            <span style={{ color: "#ffe66d" }}>~{session.partial}</span>
            <span style={{ color: "#ff6b6b" }}>✗{session.wrong}</span>
          </div>
        )}
        <span style={{ color: "#555", fontSize: 12, marginLeft: 6 }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ padding: "0 18px 16px", borderTop: "1px solid #1e1e1e" }}>
          {isEncoding && session.concepts_encoded && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Concepts Encoded</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {session.concepts_encoded.map((c, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "#a8e6cf15", border: "1px solid #a8e6cf33", color: "#a8e6cf" }}>{c}</span>
                ))}
              </div>
            </div>
          )}
          {session.topicBreakdown && Object.keys(session.topicBreakdown).length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Topic Breakdown</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(session.topicBreakdown).map(([t, v]) => {
                  const color = topicColors[t] || "#777";
                  const acc = v.attempted > 0 ? Math.round(((v.correct + (v.partial || 0) * 0.5) / v.attempted) * 100) : 0;
                  return (
                    <div key={t} style={{ background: color + "15", border: `1px solid ${color}33`, borderRadius: 6, padding: "6px 10px", fontSize: 11 }}>
                      <span style={{ color }}>{t}</span>
                      <span style={{ color: "#666", margin: "0 4px" }}>·</span>
                      <span style={{ color: "#ccc", fontFamily: "monospace" }}>{v.attempted}Q</span>
                      <span style={{ color: "#555", margin: "0 4px" }}>·</span>
                      <span style={{ color: acc >= 70 ? "#4ecdc4" : acc >= 50 ? "#ffe66d" : "#ff6b6b", fontFamily: "monospace" }}>{acc}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {(session.weakAreas || []).length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Weak Areas</div>
              {(session.weakAreas || []).map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, fontSize: 12, color: "#ccc" }}>
                  <span style={{ color: "#ff6b35" }}>⚠</span><span>{w}</span>
                </div>
              ))}
            </div>
          )}
          {session.nextSession && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Next Session Priority</div>
              <div style={{ fontSize: 12, color: "#a8e6cf", padding: "8px 12px", background: "#a8e6cf11", borderRadius: 6, borderLeft: "3px solid #a8e6cf" }}>{session.nextSession}</div>
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this session?")) onDelete(session.id); }}
              style={{ padding: "6px 14px", fontSize: 11, background: "#ff6b6b15", color: "#ff6b6b", border: "1px solid #ff6b6b33", borderRadius: 6, cursor: "pointer" }}>
              Delete Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddSessionModal({ onClose, onAdd }) {
  const [mode, setMode] = useState("json");
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState(Object.keys(SUBJECTS)[0]);
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

  const handleJsonSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const parsed = JSON.parse(jsonText);
      const sessions = Array.isArray(parsed) ? parsed : [parsed];
      for (const s of sessions) {
        if (!s.subject || !SUBJECTS[s.subject]) throw new Error(`Invalid subject: ${s.subject}. Must be one of: ${Object.keys(SUBJECTS).join(", ")}`);
        await onAdd(s);
      }
      onClose();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleFormSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const session = { subject, type, topics: selectedTopics, timestamp: new Date().toISOString() };
      if (type === "exam_practice") {
        session.attempted = parseInt(attempted) || 0;
        session.correct = parseInt(correct) || 0;
        session.partial = parseInt(partial) || 0;
        session.wrong = parseInt(wrong) || 0;
        session.estimatedMarks = estimatedMarks || null;
      } else {
        session.duration_mins = parseInt(durationMins) || null;
        session.bloom_level_reached = parseInt(bloomLevel) || null;
        session.concepts_encoded = conceptsEncoded ? conceptsEncoded.split(",").map(s => s.trim()).filter(Boolean) : [];
      }
      session.weakAreas = weakAreas ? weakAreas.split(",").map(s => s.trim()).filter(Boolean) : [];
      session.nextSession = nextSession || null;
      await onAdd(session);
      onClose();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const toggleTopic = (t) => setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const inputStyle = { width: "100%", padding: "10px 12px", fontSize: 13, background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "#e0e0e0", outline: "none", fontFamily: "'JetBrains Mono', monospace" };
  const labelStyle = { fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 14, padding: 28, width: "100%", maxWidth: 560, maxHeight: "85vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Add Session</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "#0d0d0d", borderRadius: 8, padding: 3 }}>
          {[["json", "Paste JSON"], ["form", "Use Form"]].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "8px 0", fontSize: 11, fontWeight: 600, cursor: "pointer", background: mode === m ? "#1a1a1a" : "transparent", color: mode === m ? "#fff" : "#555", border: "none", borderRadius: 6 }}>{label}</button>
          ))}
        </div>
        {mode === "json" && (
          <div>
            <label style={labelStyle}>Session JSON</label>
            <textarea value={jsonText} onChange={e => setJsonText(e.target.value)}
              placeholder={`{\n  "subject": "${Object.keys(SUBJECTS)[0]}",\n  "type": "exam_practice",\n  "topics": ["${SUBJECTS[Object.keys(SUBJECTS)[0]].topics[0]}"],\n  "attempted": 10,\n  "correct": 8,\n  "partial": 1,\n  "wrong": 1\n}`}
              style={{ ...inputStyle, height: 260, resize: "vertical" }} />
            <button onClick={handleJsonSubmit} disabled={loading || !jsonText.trim()}
              style={{ marginTop: 16, width: "100%", padding: "12px", fontSize: 13, fontWeight: 700, background: loading ? "#333" : "#4ecdc4", color: "#000", border: "none", borderRadius: 8, cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Adding..." : "Add Session"}
            </button>
          </div>
        )}
        {mode === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Subject</label>
              <div style={{ display: "flex", gap: 8 }}>
                {Object.keys(SUBJECTS).map(s => (
                  <button key={s} onClick={() => { setSubject(s); setSelectedTopics([]); }}
                    style={{ flex: 1, padding: "10px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: subject === s ? SUBJECTS[s].accent + "22" : "#1a1a1a", color: subject === s ? SUBJECTS[s].accent : "#555", border: `1px solid ${subject === s ? SUBJECTS[s].accent + "55" : "#333"}`, borderRadius: 6 }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Session Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["exam_practice", "Exam Practice"], ["deep_encoding", "Deep Encoding"]].map(([t, label]) => (
                  <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: "10px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", background: type === t ? "#ffffff11" : "#1a1a1a", color: type === t ? "#fff" : "#555", border: `1px solid ${type === t ? "#ffffff33" : "#333"}`, borderRadius: 6 }}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Topics Covered</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SUBJECTS[subject].topics.map(t => {
                  const active = selectedTopics.includes(t);
                  const color = SUBJECTS[subject].topicColors[t] || "#777";
                  return <button key={t} onClick={() => toggleTopic(t)} style={{ padding: "6px 12px", fontSize: 11, cursor: "pointer", background: active ? color + "22" : "#1a1a1a", color: active ? color : "#555", border: `1px solid ${active ? color + "55" : "#333"}`, borderRadius: 20 }}>{t}</button>;
                })}
              </div>
            </div>
            {type === "exam_practice" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                  {[["Attempted", attempted, setAttempted], ["Correct", correct, setCorrect], ["Partial", partial, setPartial], ["Wrong", wrong, setWrong]].map(([label, val, setter]) => (
                    <div key={label}><label style={labelStyle}>{label}</label><input type="number" value={val} onChange={e => setter(e.target.value)} style={inputStyle} placeholder="0" /></div>
                  ))}
                </div>
                <div><label style={labelStyle}>Estimated Marks</label><input value={estimatedMarks} onChange={e => setEstimatedMarks(e.target.value)} style={inputStyle} placeholder="32/40" /></div>
              </>
            )}
            {type === "deep_encoding" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={labelStyle}>Duration (mins)</label><input type="number" value={durationMins} onChange={e => setDurationMins(e.target.value)} style={inputStyle} placeholder="40" /></div>
                  <div><label style={labelStyle}>Bloom Level</label><input type="number" value={bloomLevel} onChange={e => setBloomLevel(e.target.value)} style={inputStyle} placeholder="4" min="1" max="6" /></div>
                </div>
                <div><label style={labelStyle}>Concepts Encoded (comma separated)</label><input value={conceptsEncoded} onChange={e => setConceptsEncoded(e.target.value)} style={inputStyle} placeholder="Concept 1, Concept 2" /></div>
              </>
            )}
            <div><label style={labelStyle}>Weak Areas (comma separated)</label><input value={weakAreas} onChange={e => setWeakAreas(e.target.value)} style={inputStyle} placeholder="Weak area 1, Weak area 2" /></div>
            <div><label style={labelStyle}>Next Session Priority</label><input value={nextSession} onChange={e => setNextSession(e.target.value)} style={inputStyle} placeholder="What to focus on next" /></div>
            <button onClick={handleFormSubmit} disabled={loading} style={{ width: "100%", padding: "12px", fontSize: 13, fontWeight: 700, background: loading ? "#333" : SUBJECTS[subject].accent, color: "#000", border: "none", borderRadius: 8, cursor: loading ? "wait" : "pointer" }}>{loading ? "Adding..." : "Add Session"}</button>
          </div>
        )}
        {error && <div style={{ marginTop: 14, padding: "10px 14px", background: "#ff6b6b15", border: "1px solid #ff6b6b33", borderRadius: 6, fontSize: 12, color: "#ff6b6b" }}>{error}</div>}
      </div>
    </div>
  );
}

function SubjectDashboard({ subject, sessions, onDelete }) {
  const subj = SUBJECTS[subject];
  const [innerTab, setInnerTab] = useState("dashboard");
  const total = sessions.reduce((a, s) => a + (s.attempted || 0), 0);
  const correct = sessions.reduce((a, s) => a + (s.correct || 0), 0);
  const partial = sessions.reduce((a, s) => a + (s.partial || 0), 0);
  const wrong = sessions.reduce((a, s) => a + (s.wrong || 0), 0);
  const pct = total > 0 ? Math.round(((correct + partial * 0.5) / total) * 100) : 0;
  const days = daysUntil(subj.examDate);
  const weakFreq = {};
  sessions.flatMap(s => s.weakAreas || []).forEach(w => { weakFreq[w] = (weakFreq[w] || 0) + 1; });
  const topWeak = Object.entries(weakFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const tabBtn = (t, label) => (
    <button onClick={() => setInnerTab(t)} style={{ padding: "7px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", background: "none", border: "none", color: innerTab === t ? subj.accent : "#555", borderBottom: innerTab === t ? `2px solid ${subj.accent}` : "2px solid transparent" }}>{label}</button>
  );
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{subj.code} — {subj.fullName}</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Exam: {new Date(subj.examDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: days <= 7 ? "#ff6b6b" : subj.accent, fontFamily: "monospace" }}>{days}</div>
          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>days left</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid #1e1e1e", marginBottom: 20 }}>
        {tabBtn("dashboard", "Overview")}{tabBtn("coverage", "Topic Coverage")}{tabBtn("log", `Log (${sessions.length})`)}
      </div>
      {innerTab === "dashboard" && (
        <div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
            <StatBox label="Sessions" value={sessions.length} color={subj.accent} />
            <StatBox label="Questions" value={total} color="#ccc" />
            <StatBox label="Correct" value={correct} color="#4ecdc4" sub={`${total > 0 ? Math.round(correct/total*100) : 0}%`} />
            <StatBox label="Partial" value={partial} color="#ffe66d" />
            <StatBox label="Wrong" value={wrong} color="#ff6b6b" />
            <StatBox label="Score" value={`${pct}%`} color={pct >= 70 ? "#4ecdc4" : pct >= 50 ? "#ffe66d" : "#ff6b6b"} />
          </div>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Recurring Weak Areas</div>
            {topWeak.length === 0 ? <div style={{ fontSize: 13, color: "#444" }}>None flagged yet</div>
              : topWeak.map(([area, count]) => (
                <div key={area} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#ccc", flex: 1, paddingRight: 10 }}>⚠ {area}</div>
                  <div style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: count >= 3 ? "#ff6b6b22" : "#ff6b3522", color: count >= 3 ? "#ff6b6b" : "#ff6b35", border: `1px solid ${count >= 3 ? "#ff6b6b33" : "#ff6b3533"}` }}>×{count}</div>
                </div>
              ))}
          </div>
          {sessions.length > 0 && sessions[sessions.length - 1].nextSession && (
            <div style={{ padding: "12px 16px", background: "#a8e6cf11", border: "1px solid #a8e6cf33", borderLeft: "3px solid #a8e6cf", borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: "#a8e6cf88", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Recommended next</div>
              <div style={{ fontSize: 13, color: "#a8e6cf" }}>{sessions[sessions.length - 1].nextSession}</div>
            </div>
          )}
        </div>
      )}
      {innerTab === "coverage" && <TopicHeatmap subject={subject} sessions={sessions} />}
      {innerTab === "log" && (
        <div>
          {sessions.length === 0 ? <div style={{ color: "#444", fontSize: 13 }}>No sessions yet.</div>
            : [...sessions].reverse().map((s, i) => <SessionCard key={s.id} session={s} index={sessions.length - 1 - i} subject={subject} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}

function OverviewPanel({ allSessions }) {
  const subjects = Object.keys(SUBJECTS);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${subjects.length}, 1fr)`, gap: 14, marginBottom: 22 }}>
        {subjects.map(subj => {
          const sessions = allSessions[subj] || [];
          const total = sessions.reduce((a, s) => a + (s.attempted || 0), 0);
          const correct = sessions.reduce((a, s) => a + (s.correct || 0), 0);
          const partial = sessions.reduce((a, s) => a + (s.partial || 0), 0);
          const pct = total > 0 ? Math.round(((correct + partial * 0.5) / total) * 100) : 0;
          const days = daysUntil(SUBJECTS[subj].examDate);
          const accent = SUBJECTS[subj].accent;
          const agg = aggregateTopics(sessions, subj);
          const allTopics = SUBJECTS[subj].topics.filter(t => t !== "Other");
          const studied = allTopics.filter(t => (agg[t]?.attempted || 0) > 0).length;
          const coveragePct = Math.round((studied / allTopics.length) * 100);
          return (
            <div key={subj} style={{ background: "#111", border: `1px solid ${accent}22`, borderTop: `3px solid ${accent}`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>{SUBJECTS[subj].label}</div>
                  <div style={{ fontSize: 10, color: "#555" }}>{SUBJECTS[subj].code}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: days <= 7 ? "#ff6b6b" : accent, fontFamily: "monospace" }}>{days}d</div>
                  <div style={{ fontSize: 9, color: "#555" }}>to exam</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[{ label: "score", value: `${pct}%`, color: pct >= 70 ? "#4ecdc4" : pct >= 50 ? "#ffe66d" : pct > 0 ? "#ff6b6b" : "#444" }, { label: "sessions", value: sessions.length, color: "#ccc" }, { label: "questions", value: total, color: "#777" }].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: "center", background: "#0d0d0d", borderRadius: 6, padding: "8px 0" }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</div>
                    <div style={{ fontSize: 9, color: "#555" }}>{label}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#555", marginBottom: 4 }}>
                  <span>Topic coverage</span>
                  <span style={{ color: coveragePct === 100 ? "#4ecdc4" : coveragePct > 50 ? "#ffe66d" : "#ff6b6b" }}>{studied}/{allTopics.length} topics</span>
                </div>
                <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${coveragePct}%`, background: accent, borderRadius: 2, transition: "width 0.6s ease" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 18 }}>
        <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Recent Weak Areas — All Subjects</div>
        {subjects.map(subj => (allSessions[subj] || []).slice(-2).flatMap(s => (s.weakAreas || []).map(w => ({ w, subj })))).flat().slice(0, 10).map(({ w, subj }, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: SUBJECTS[subj].accent + "22", color: SUBJECTS[subj].accent, border: `1px solid ${SUBJECTS[subj].accent}33`, whiteSpace: "nowrap" }}>{subj}</span>
            <span style={{ fontSize: 12, color: "#ccc" }}>⚠ {w}</span>
          </div>
        ))}
        {subjects.every(s => (allSessions[s] || []).length === 0) && <div style={{ fontSize: 13, color: "#444" }}>No sessions yet. Start drilling!</div>}
      </div>
    </div>
  );
}

export default function StudyTracker() {
  const [activeTab, setActiveTab] = useState("overview");
  const [allSessions, setAllSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const subjectKeys = Object.keys(SUBJECTS);

  const loadSessions = async () => {
    try {
      const raw = await fetchSessions();
      setAllSessions(groupBySubject(raw, subjectKeys));
      setError(null);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { loadSessions(); }, []);

  const handleAdd = async (session) => { await addSession(session); await loadSessions(); };
  const handleDelete = async (id) => { await deleteSession(id); await loadSessions(); };

  const tabs = [{ id: "overview", label: "Overview" }, ...subjectKeys.map(id => ({ id, label: SUBJECTS[id].label }))];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#555", fontSize: 14 }}>Loading sessions...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#e0e0e0", fontFamily: "'JetBrains Mono','Courier New',monospace", paddingBottom: 60 }}>
      <div style={{ background: "#111", borderBottom: "1px solid #1e1e1e", padding: "18px 28px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>Exam Study Tracker</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{subjectKeys.map(k => SUBJECTS[k].code).join(" · ")}</div>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ padding: "9px 20px", fontSize: 12, fontWeight: 700, background: "#4ecdc4", color: "#000", border: "none", borderRadius: 8, cursor: "pointer", letterSpacing: 0.5 }}>+ Add Session</button>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map(t => {
            const accent = t.id !== "overview" ? SUBJECTS[t.id]?.accent : "#fff";
            return <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", background: "none", border: "none", color: activeTab === t.id ? accent : "#555", borderBottom: activeTab === t.id ? `2px solid ${accent}` : "2px solid transparent", transition: "all 0.15s" }}>{t.label}</button>;
          })}
        </div>
      </div>
      {error && <div style={{ margin: "20px 28px 0", padding: "12px 16px", background: "#ff6b6b15", border: "1px solid #ff6b6b33", borderRadius: 8, fontSize: 12, color: "#ff6b6b" }}>Error: {error}</div>}
      <div style={{ padding: "24px 28px" }}>
        {activeTab === "overview" ? <OverviewPanel allSessions={allSessions} /> : <SubjectDashboard subject={activeTab} sessions={allSessions[activeTab] || []} onDelete={handleDelete} />}
      </div>
      {showAddModal && <AddSessionModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
    </div>
  );
}
