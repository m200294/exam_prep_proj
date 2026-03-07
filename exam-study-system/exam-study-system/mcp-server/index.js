import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const SUBJECTS = ["MATH", "PHYS", "CHEM"];
const SESSION_TYPES = ["exam_practice", "deep_encoding"];

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const server = new McpServer({
  name: "exam-study-system",
  version: "1.0.0",
});

server.tool(
  "save_study_session",
  {
    subject: z.enum(SUBJECTS),
    type: z.enum(SESSION_TYPES),
    topics: z.array(z.string()).optional(),
    attempted: z.number().nonnegative().optional(),
    correct: z.number().nonnegative().optional(),
    partial: z.number().nonnegative().optional(),
    wrong: z.number().nonnegative().optional(),
    estimated_marks: z.string().optional(),
    weak_areas: z.array(z.string()).optional(),
    next_session: z.string().optional(),
    topic_breakdown: z.record(
      z.object({
        attempted: z.number().nonnegative().optional(),
        correct: z.number().nonnegative().optional(),
        partial: z.number().nonnegative().optional(),
        wrong: z.number().nonnegative().optional(),
      })
    ).optional(),
    duration_mins: z.number().nonnegative().optional(),
    bloom_level_reached: z.number().int().min(1).max(6).optional(),
    concepts_encoded: z.array(z.string()).optional(),
  },
  async (input) => {
    const apiUrl = getRequiredEnv("TRACKER_API_URL");
    const apiKey = process.env.TRACKER_API_KEY;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(apiKey ? { "x-api-key": apiKey } : {}),
      },
      body: JSON.stringify(input),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = payload?.error || `API request failed with status ${response.status}`;
      throw new Error(message);
    }

    return {
      content: [
        {
          type: "text",
          text: `Saved ${input.subject} ${input.type} session successfully.`,
        },
        {
          type: "text",
          text: JSON.stringify(payload?.session ?? payload, null, 2),
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
