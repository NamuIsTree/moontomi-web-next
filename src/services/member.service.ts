import { createClient } from "@/lib/supabase/client";
import type { MemberPublicInfo } from "@/types/domain";

export async function fetchMembers(): Promise<MemberPublicInfo[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("member")
    .select("member_id, name")
    .order("member_id", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    member_id: row.member_id,
    name: row.name,
  }));
}

export async function verifyMemberPassword(
  password: string
): Promise<MemberPublicInfo> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("verify_member_login", {
    p_password: password,
  });

  if (error || !data) {
    throw new Error(error?.message || "일치하는 멤버 비밀번호가 없습니다.");
  }

  const parsed = data as { member_id: number; name: string };
  return {
    member_id: parsed.member_id,
    name: parsed.name,
  };
}
