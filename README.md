# MOONTOMI Web Next

**문형규의 토요일, 음악에 미치는 날 (대중 음악의 이해)** — 매주 진행되는 앨범 음평회의 기록과 평점, 한줄평, 음악 칼럼, 추천 음반/싱글 아카이브를 축적하고 공유하는 음악 비평 커뮤니티 웹 매거진입니다.

- **기획 및 도메인 명세**: [PRODUCT.md](./PRODUCT.md)
- **디자인 시스템 명세**: [DESIGN.md](./DESIGN.md)
- **워크스페이스 및 하네스 수칙**: [GEMINI.md](./GEMINI.md)

---

## 주요 기술 스택
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling & Typography**: Tailwind CSS v4, Lucide Icons, Custom Fonts (`Bayaters Stamp`, `LINE Seed KR`, `Lobster`, `Nanum Myeongjo ExtraBold`, `Nohemi`, `Roboto Mono`)
- **Rich Text & UI Libraries**: Tiptap (`@tiptap/react`), `emoji-picker-react`, Swiper
- **Backend / Database**: Supabase Serverless (PostgreSQL, Row Level Security, RPC Functions, Storage) + Next.js Server Data Cache (`unstable_cache` & `revalidateTag` on Vercel)
- **PWA**: Web App Manifest (`manifest.json`, `install.webmanifest`) 및 Service Worker 지원
- **Brand Colors**:
  - Midnight Slate (`#242d3c`): 헤더, 네비게이션, 모달 헤더, 주요 프레임
  - Coral Pulse (`#ff8080`): 강조 액션, 미열람 알림 레드닷, 별점 포인트, 로딩 스피너

---

## 주요 기능
- **홈 (`/` · Saturday Listening Room)**:
  - 명예의 전당(`Hall of Fame`) · 수치의 전당(`Hall of Shame`) Top 10 앨범 캐러셀 (컴필레이션 시즌 제외)
  - 최신 칼럼 피드(`Recent Columns`), 최신 음평회(`Latest Lectures`), 아카이브 큐레이션(`Archive Curate` — `ALBUM` 녹색 / `SINGLE` 주황색 배지)
- **음평회 (`/lectures`, `/lecture/[id]`) & 한줄평 (`/comment/create/[id]`, `/comment/edit/[id]`)**:
  - 블라인드 진행(`Open?`, 자물쇠 잠금 상태) 및 마감 후 동시 공개(열림 애니메이션, 평균 평점 소수점 1자리·호버 시 3자리, 베스트 트랙 1~3위 집계)
  - **회차 빠른 이동 스위처(`LectureEpisodeSwitcher`)**: 음평회 상세 페이지에서 앨범명 클릭 시 `XXX회 - 아티스트 (앨범명)` 스크롤·검색 드롭다운 및 이전/다음 회차 퀵 이동 제공
  - **1 음평회 1 한줄평 정책**: 기작성 한줄평 존재 시 작성 버튼 클릭 시 수정 페이지로 자동 이동
  - **멤버 인증 기반 작성·수정**: 작성 및 수정 시 표시 닉네임(`writer`) 자유 변경 가능, `emoji-picker-react` 전체 이모지 선택기 지원
- **칼럼 (`/reviews`, `/review/[id]`, `/review/create`, `/review/[id]/edit`)**:
  - 카테고리(`칼럼`, `결산`, `잡설`) 필터 및 최신순/조회수순 정렬
  - Tiptap 기반 리치 텍스트 에디터·뷰어 (유튜브 임베드, 이미지 정렬, 모바일 `100vw` 가로 오버플로우 방지, 본문 하단 총 글자 수 표기 적용)
- **둘러보기 (`/lookup`)**:
  - 10인의 통합 멤버 계정(`문교수`, `나무트리`, `분조장`, `선유랑`, `더러운눈동자`, `설향박스팜`, `박평식`, `닉네임고민중`, `노란양말`, `아인치`) 복수 선택 모달
  - 선택 멤버의 과거 닉네임 이력을 통합한 한줄평 통계(총 건수, 평균·최고·최저 평점) 및 회차순/점수순 열람
- **아카이브 스테이션 (`/archive`, `/archive/[id]`)**:
  - 리스트/그리드 뷰 전환, `0.0점 ~ 5.0점`(`0.5점` 단위) 최소~최대 별점 범위(Range) 필터, 유형(`ALBUM`/`SINGLE`) 필터, 곡·아티스트(한/영/발음)·추천인 검색
  - 데스크톱 좌측 스티키 상세 배너 및 모바일 상단 접이식 미니 플레이어(공유 버튼 우측 투고일 표기, YouTube/Spotify 임베드 플레이어)
- **멤버 & 최근 소식 허브 (`MemberAuthContext`) & 어드민 (`/admin`)**:
  - 데스크톱 좌측 사이드바 하단 / 모바일 하단 6열 탭바 통합 모달에서 간편 비밀번호 로그인·계정 전환 및 새 컨텐츠(`새 음평회`, `새 칼럼`, `새 아카이브`) 레드닷 알림 제공
  - `/admin` 대시보드에서 음평회·아카이브(0.0~5.0 별점 드래그 입력)·음반(앨범·싱글 등록 중 모달로 아티스트 동시 등록)·장르·시즌 관리, 검색 모달 선택기(`AdminSearchSelect`) 기반 대상 앨범·아티스트·시즌 검색 선택 및 멤버 비밀번호 변경 지원

---

## 데이터베이스 구조 (`public`)
- **핵심 테이블**:
  - `member`: 통합 멤버 계정 (RLS 및 컬럼 단위 권한 제어로 `password` 해시 외부 노출 차단)
  - `artist`, `genre` (`K-POP`은 `Korean POP`으로 통합), `season`, `archive`
  - `album`, `album_genre`, `single`, `single_genre`
  - `lecture` (음평회), `comment` (한줄평, `member_id` 매핑)
  - `review` (칼럼/투고, `member_id` 매핑)
  - 모든 테이블에 `created_at`, `modified_at` (`timestamptz`, 신규 생성 시 `now()` 기본값 및 `UPDATE` 시 자동 갱신 트리거 적용)
- **주요 RPC 함수**:
  - `verify_member_login`, `create_comment`, `update_comment`, `create_review`, `update_review`, `admin_action`, `increment_review_views`

---

## 로컬 실행 방법

1. 패키지 설치:
   ```bash
   npm install
   ```
2. 환경 변수 설정 (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ybkxwjmrgrnlyogykqxm.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
3. 개발 서버 실행:
   ```bash
   npm run dev
   ```
4. 타입 체크:
   ```bash
   npx tsc --noEmit
   ```
