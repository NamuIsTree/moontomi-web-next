import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { createClient } from "@/lib/supabase/client";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
} from "@/lib/admin-session";

function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || !process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json(
        { ok: false, message: "서버에 관리자 환경변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const password = String(body?.password ?? "").trim();

    if (!password || !passwordMatches(password, adminPassword)) {
      return NextResponse.json(
        { ok: false, message: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // Double-check against the DB-side bcrypt hash so env and DB stay in sync.
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_action", {
      p_password: password,
      p_action: "verify_password",
      p_payload: {},
    });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: "DB 관리자 비밀번호와 일치하지 않습니다. 설정을 확인해 주세요.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, await createAdminSessionToken(), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ADMIN_SESSION_MAX_AGE,
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
