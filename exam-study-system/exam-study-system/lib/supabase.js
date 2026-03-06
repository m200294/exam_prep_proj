import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchSessions() {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("timestamp", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addSession(session) {
  const row = {
    id: session.id || `${session.subject.toLowerCase()}-${Date.now()}`,
    subject: session.subject,
    timestamp: session.timestamp || new Date().toISOString(),
    type: session.type || "exam_practice",
    topics: session.topics || [],
    topic: session.topic || null,
    attempted: session.attempted || 0,
    correct: session.correct || 0,
    partial: session.partial || 0,
    wrong: session.wrong || 0,
    estimated_marks: session.estimatedMarks || session.estimated_marks || null,
    topic_breakdown: session.topicBreakdown || session.topic_breakdown || null,
    duration_mins: session.duration_mins || null,
    bloom_level_reached: session.bloom_level_reached || null,
    layers_covered: session.layers_covered || null,
    concepts_encoded: session.concepts_encoded || null,
    weak_areas: session.weakAreas || session.weak_areas || [],
    next_session: session.nextSession || session.next_session || null,
  };
  const { data, error } = await supabase.from("sessions").insert(row).select();
  if (error) throw error;
  return data[0];
}

export async function deleteSession(id) {
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw error;
}

export function groupBySubject(sessions, subjectKeys) {
  const grouped = {};
  subjectKeys.forEach((k) => { grouped[k] = []; });
  sessions.forEach((s) => {
    const normalized = {
      ...s,
      estimatedMarks: s.estimated_marks,
      topicBreakdown: s.topic_breakdown,
      weakAreas: s.weak_areas || [],
      nextSession: s.next_session,
    };
    if (grouped[s.subject]) {
      grouped[s.subject].push(normalized);
    }
  });
  return grouped;
}
