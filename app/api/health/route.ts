import { BACKEND_URL, UPSTREAM_HEADERS } from "../_config";

/**
 * Probes the backend so the browser can show an honest status without
 * depending on CORS. Prefers /health, falling back to / for older builds
 * that predate the endpoint.
 */
export async function GET() {
  const attempts: Array<{ path: string; legacy?: boolean }> = [
    { path: "/health" },
    { path: "/", legacy: true },
  ];

  for (const attempt of attempts) {
    try {
      const upstream = await fetch(`${BACKEND_URL}${attempt.path}`, {
        headers: UPSTREAM_HEADERS,
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!upstream.ok) continue;

      const text = await upstream.text();

      try {
        const payload = JSON.parse(text);
        return Response.json({
          reachable: true,
          legacyBackend: attempt.legacy ?? false,
          backend: payload,
        });
      } catch {
        return Response.json({ reachable: true, legacyBackend: attempt.legacy ?? false });
      }
    } catch {
      // Try the next probe.
    }
  }

  return Response.json({ reachable: false }, { status: 502 });
}