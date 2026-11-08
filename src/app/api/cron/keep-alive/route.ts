import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const supabase = createClient();
    const { data, count, error } = await supabase
      .from("season")
      .select("season_id", { count: "exact" })
      .limit(1);

    if (error) {
      console.error("[keep-alive] Supabase query failed:", error);
      return Response.json(
        {
          ok: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return Response.json({
      ok: true,
      message: "Supabase keep-alive ping succeeded",
      seasonCount: count ?? data?.length ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[keep-alive] Unexpected error:", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
