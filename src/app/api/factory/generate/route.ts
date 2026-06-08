import { isFactoryConfigured, isFactoryAuthenticated } from "@/lib/factory-auth";
import { generateContent } from "@/lib/factory/ai/generate";
import type { AIContext } from "@/lib/factory/ai/types";

export async function POST(req: Request): Promise<Response> {
  try {
    if (isFactoryConfigured() && !(await isFactoryAuthenticated())) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json() as { aiContext: AIContext };

    if (!body.aiContext?.nombre) {
      return Response.json({ error: "aiContext.nombre is required" }, { status: 400 });
    }

    // generateContent() reads ANTHROPIC_API_KEY from process.env (server-side only)
    // The key is NEVER sent to the client
    const result = await generateContent(body.aiContext);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[factory/generate]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
