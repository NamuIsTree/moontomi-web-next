import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/client";

const ADMIN_COOKIE_NAME = "moontomi_admin_session";
const ADMIN_COOKIE_VALUE = "authenticated_moontomi_admin";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (sessionCookie !== ADMIN_COOKIE_VALUE) {
      return NextResponse.json(
        { ok: false, message: "관리자 로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const action = String(body?.action ?? "").trim();
    const payload = body?.payload ?? {};

    if (!action) {
      return NextResponse.json(
        { ok: false, message: "수행할 작업(action)이 지정되지 않았습니다." },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc("admin_action", {
      p_password: "88888888",
      p_action: action,
      p_payload: payload,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message || "작업 수행에 실패했습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : "서버 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
