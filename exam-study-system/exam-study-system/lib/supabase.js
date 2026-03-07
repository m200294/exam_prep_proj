import { createClient } from "@supabase/supabase-js";
import { SUBJECTS } from "./subjects";

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

// ═══════════════════════════════════════════════════════
// Database operations
// ═══════════════════════════════════════════════════════

export async function fetchSessions() {
  const { data, error } = await getSupabaseClient()
    .from("sessions")
    .select("*")
    .order("timestamp", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addSession(session) {
  // Convert JS camelCase to DB snake_case
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
  const { data, error } = await getSupabaseClient().from("sessions").insert(row).select();
  if (error) throw error;
  return data[0];
}

export async function updateSession(id, updates) {
  const row = {
    subject: updates.subject,
    timestamp: updates.timestamp || new Date().toISOString(),
    type: updates.type || "exam_practice",
    topics: updates.topics || [],
    topic: updates.topic || null,
    attempted: updates.attempted || 0,
    correct: updates.correct || 0,
    partial: updates.partial || 0,
    wrong: updates.wrong || 0,
    estimated_marks: updates.estimatedMarks || updates.estimated_marks || null,
    topic_breakdown: updates.topicBreakdown || updates.topic_breakdown || null,
    duration_mins: updates.duration_mins || null,
    bloom_level_reached: updates.bloom_level_reached || null,
    layers_covered: updates.layers_covered || null,
    concepts_encoded: updates.concepts_encoded || null,
    weak_areas: updates.weakAreas || updates.weak_areas || [],
    next_session: updates.nextSession || updates.next_session || null,
  };

  const { data, error } = await getSupabaseClient().from("sessions").update(row).eq("id", id).select();
  if (error) throw error;
  return data[0];
}

export async function deleteSession(id) {
  const { error } = await getSupabaseClient().from("sessions").delete().eq("id", id);
  if (error) throw error;
}

// Group sessions by subject
export function groupBySubject(sessions) {
  const grouped = Object.fromEntries(Object.keys(SUBJECTS).map((key) => [key, []]));
  sessions.forEach((s) => {
    // Normalize DB snake_case back to camelCase for the UI
    const normalized = {
      ...s,
      estimatedMarks: s.estimated_marks,
      topicBreakdown: s.topic_breakdown,
      duration_mins: s.duration_mins,
      bloom_level_reached: s.bloom_level_reached,
      concepts_encoded: s.concepts_encoded || [],
      weakAreas: s.weak_areas || [],
      nextSession: s.next_session,
    };
    if (grouped[s.subject]) {
      grouped[s.subject].push(normalized);
    }
  });
  return grouped;
}
