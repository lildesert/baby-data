import type { Route } from "../+types/root";

export async function loader({ request }: Route.ActionArgs) {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  try {
    const url = new URL("/", `http://${host}`);
    await fetch(url.toString(), {
      method: "HEAD",
      headers: { "X-Healthcheck": "true" },
    }).then((r) => {
      if (!r.ok) return Promise.reject(r);
    });

    return new Response("OK");
  } catch (error: unknown) {
    console.log("healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
}
