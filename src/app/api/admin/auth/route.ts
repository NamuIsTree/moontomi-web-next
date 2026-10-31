import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

const ADMIN_COOKIE_NAME = "moontomi_admin_session";
const ADMIN_COOKIE_VALUE = "authenticated_moontomi_admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body?.password ?? "").trim();

    if (password !== "88888888") {
      return NextResponse.json(
        { ok: false, message: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const { error } = await supabase.rpc("admin_action", {
      p_password: password,
      p_action: "verify_password",
      p_payload: {},
    });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message || "인증에 실패했습니다." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
