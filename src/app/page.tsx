import Link from "next/link";
import { Disc3, Newspaper, History, CirclePlay } from "lucide-react";

export default function HomePage() {
  return (
    <div className="py-10 space-y-12 max-w-[1000px] mx-auto">
      <section className="text-center space-y-4 py-8 border-b border-gray-200">
        <h1 className="font-stamp text-4xl md:text-5xl text-[#242d3c]">
          HALL OF FAME
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          문형규의 토요일, 음악에 미치는 날 — Next.js &amp; Supabase Edition
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href="/reviews"
          className="group p-6 rounded-xl border border-gray-200 hover:border-[#ff8080] transition-all shadow-xs hover:shadow-md flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-[#242d3c] text-white group-hover:bg-[#ff8080] transition-colors">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#242d3c]">칼럼 (Reviews)</h2>
            <p className="text-sm text-gray-500 mt-1">
              결산, 칼럼, 잡설 등 음악에 관한 다양한 원고와 투고글을 확인하세요.
            </p>
          </div>
        </Link>

        <Link
          href="/lectures"
          className="group p-6 rounded-xl border border-gray-200 hover:border-[#ff8080] transition-all shadow-xs hover:shadow-md flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-[#242d3c] text-white group-hover:bg-[#ff8080] transition-colors">
            <Disc3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#242d3c]">
              음평회 (Lectures)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              회차별 음평회 앨범과 평점, 베스트 트랙 및 한줄평을 만나보세요.
            </p>
          </div>
        </Link>

        <Link
          href="/lookup"
          className="group p-6 rounded-xl border border-gray-200 hover:border-[#ff8080] transition-all shadow-xs hover:shadow-md flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-[#242d3c] text-white group-hover:bg-[#ff8080] transition-colors">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#242d3c]">
              둘러보기 (Lookup)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              닉네임으로 그동안 작성한 음평회 한줄평과 점수를 검색해보세요.
            </p>
          </div>
        </Link>

        <Link
          href="/archive"
          className="group p-6 rounded-xl border border-gray-200 hover:border-[#ff8080] transition-all shadow-xs hover:shadow-md flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-[#242d3c] text-white group-hover:bg-[#ff8080] transition-colors">
            <CirclePlay className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#242d3c]">
              아카이브 (Archive)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              추천 앨범 및 싱글 아카이브와 외부 스트리밍 링크를 감상하세요.
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}
