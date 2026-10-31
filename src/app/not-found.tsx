import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export default function NotFound() {
  return (
    <PageContainer width="reading" className="py-24 text-center space-y-4">
      <h1 className="font-stamp text-4xl text-[#242d3c]">404 NOT FOUND</h1>
      <p className="text-sm text-[#808080]">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <div className="pt-2">
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-sm bg-[#242d3c] text-white text-xs font-bold hover:opacity-90 transition-opacity"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </PageContainer>
  );
}
