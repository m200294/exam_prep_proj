import { NextResponse } from "next/server";
import { addSession } from "../../../lib/supabase";
import { SUBJECTS } from "../../../lib/subjects";

const VALID_TYPES = new Set(["exam_practice", "deep_encoding"]);

function normalizeSessionPayload(body) {
  return {
    subject: body.subject,
    type: body.type || "exam_practice",
    topics: Array.isArray(body.topics) ? body.topics : [],
    topic: body.topic || null,
    attempted: Number(body.attempted || 0),
    correct: Number(body.correct || 0),
    partial: Number(body.partial || 0),
    wrong: Number(body.wrong || 0),
    estimatedMarks: body.estimatedMarks || body.estimated_marks || null,
    topicBreakdown: body.topicBreakdown || body.topic_breakdown || null,
    duration_mins: body.duration_mins ?? null,
    bloom_level_reached: body.bloom_level_reached ?? null,
    concepts_encoded: Array.isArray(body.concepts_encoded) ? body.concepts_encoded : null,
    weakAreas: Array.isArray(body.weakAreas)
      ? body.weakAreas
      : Array.isArray(body.weak_areas)
        ? body.weak_areas
        : [],
    nextSession: body.nextSession || body.next_session || null,
    timestamp: body.timestamp || new Date().toISOString(),
  };
}

function validateSessionPayload(session) {
  if (!session || typeof session !== "object") {
    return "Request body must be a JSON object.";
  }

  if (!session.subject || !SUBJECTS[session.subject]) {
    return "Invalid subject. Must be one of MATH, PHYS, or CHEM.";
  }

  if (!VALID_TYPES.has(session.type)) {
    return "Invalid type. Must be exam_practice or deep_encoding.";
  }

  if (session.type === "exam_practice") {
    if ([session.attempted, session.correct, session.partial, session.wrong].some((value) => Number.isNaN(value) || value < 0)) {
      return "Exam practice counts must be non-negative numbers.";
    }
  }

  if (session.type === "deep_encoding") {
    if (session.duration_mins != null && Number.isNaN(Number(session.duration_mins))) {
      return "duration_mins must be a number when provided.";
    }

    if (session.bloom_level_reached != null && Number.isNaN(Number(session.bloom_level_reached))) {
      return "bloom_level_reached must be a number when provided.";
    }
  }

  return null;
}

export async function POST(request) {
  try {
    const expectedApiKey = process.env.SESSION_API_KEY;

    if (expectedApiKey) {
      const providedApiKey = request.headers.get("x-api-key");

      if (!providedApiKey || providedApiKey !== expectedApiKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();
    const session = normalizeSessionPayload(body);
    const validationError = validateSessionPayload(session);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const createdSession = await addSession(session);

    return NextResponse.json({ success: true, session: createdSession });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while saving session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
