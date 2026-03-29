import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response("Bad Request", { status: 400 });
  }

  const messages = body.messages as UIMessage[];

  const result = streamText({
    model: "anthropic/claude-sonnet-4.6" as Parameters<typeof streamText>[0]["model"],
    system:
      "You are VentureMind AI, an intelligent assistant for venture capital professionals. " +
      "Help with deal analysis, portfolio insights, meeting preparation, and investment research. " +
      "Be concise, data-driven, and actionable.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
