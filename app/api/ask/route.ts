import { BACKEND_URL, UPSTREAM_TIMEOUT_MS, UPSTREAM_HEADERS } from "../_config";

type AskBody = {
  question?: string;
  answer?: string;
  sources?: unknown[];
  detail?: string;
};

export async function POST(request: Request) {
  let body: AskBody;

  try {
    body = (await request.json()) as AskBody;
  } catch {
    return Response.json({ detail: "Request body was not valid JSON." }, { status: 400 });
  }

  const question = (body.question ?? "").trim();

  if (!question) {
    return Response.json({ answer: "Please ask a question.", sources: [] });
  }

  if (question.length > 1000) {
    return Response.json({ detail: "Question is longer than 1000 characters." }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: UPSTREAM_HEADERS,
      body: JSON.stringify({ question }),
      signal: controller.signal,
      cache: "no-store",
    });

    // Pass the upstream body through untouched so real errors stay visible.
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";

    return Response.json(
      aborted
        ? {
            answer: "The assistant took too long to respond. It may be starting up — please retry.",
            sources: [],
            detail: `Upstream timed out after ${UPSTREAM_TIMEOUT_MS}ms`,
          }
        : {
            answer: "The assistant is unreachable right now. Please try again shortly.",
            sources: [],
            detail: "Could not reach the backend service.",
          },
      { status: aborted ? 504 : 502 },
    );
  } finally {
    clearTimeout(timer);
  }
}