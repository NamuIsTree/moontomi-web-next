# MOONTOMI Workspace Guidelines (`GEMINI.md`)

이 프로젝트는 **MOONTOMI (문형규의 토요일, 음악에 미치는 날 — 대중 음악의 이해)** 웹 애플리케이션(`Next.js App Router + TypeScript + Tailwind CSS v4 + Supabase`)입니다.

기능 추가, 수정, UI/UX 작업 시 항상 루트의 **[PRODUCT.md](./PRODUCT.md)** 및 **[DESIGN.md](./DESIGN.md)** 문서를 기준 진실(Source of Truth)로 삼고 아래 핵심 원칙을 반드시 준수하세요.

---

## 1. 아키텍처 & 데이터 규칙
- **Serverless Supabase 구조**: 별도 백엔드 서버 없이 `src/services/*.service.ts`를 통해 Supabase 테이블 및 RPC 함수(`create_comment`, `update_comment`, `create_review`, `update_review`, `verify_member_login`, `admin_action`)를 호출합니다.
- **멤버 인증 및 허브 (`MemberAuthContext`)**:
  - 멤버 로그인 상태, 최근 컨텐츠 알림(`새 음평회`, `새 칼럼`, `새 아카이브`) 및 레드닷(`unreadCount`), 그리고 전역 커스텀 알림 모달(`showAlert`)은 `src/context/MemberAuthContext.tsx`에서 통합 관리합니다.
  - 한줄평이나 칼럼 작성/수정 등 멤버 인증이 필요한 액션은 `requireMemberAuth()`를 사용합니다.
- **음평회 리추얼 & 랭킹 규칙**:
  - `lecture.rating === null`인 회차는 블라인드 진행 중(`Open?`) 상태이며, 한줄평 카드는 자물쇠(Padlock) 뒤에 가려져 있다가 공개 시 열림 애니메이션과 함께 노출됩니다.
  - 평점 랭킹 산정 시 컴필레이션 시즌(`season_id = 8`)은 제외합니다.

---

## 2. UI / UX & 디자인 시스템 필수 수칙
- **브랜드 투톤 컬러 고정**:
  - 구조/프레임은 **Midnight Slate (`#242d3c`)**, 강조/액션/레드닷/스피너는 **Coral Pulse (`#ff8080`)**, 본문 배경은 **순백색 (`#ffffff`)**을 사용합니다. 임의의 네온 컬러나 보라색/블루 그라데이션을 절대 사용하지 마세요.
- **서체 역할 분리 (`Role-Bound Typeface`)**:
  - `Bayaters Stamp` (`font-stamp`): 상단 헤더 워드마크(`MOONTOMI`) 및 네비게이션 로고 전용
  - `LINE Seed KR` (`font-sans`): 기본 UI 및 본문
  - `Lobster` (`font-lobster`): 오직 음평회·아카이브 **평점 숫자**에만 사용 (일반 텍스트나 버튼에 사용 금지)
  - `Nanum Myeongjo ExtraBold` (`font-myeongjo`): 칼럼 제목 및 작성자 표기 전용
  - `Nohemi` (`font-nohemi`): 아카이브 메타데이터, 영문 배지(`ALBUM` / `SINGLE`), `HALL OF FAME` 버튼
- **상단 헤더 대칭 유지 (`Symmetrical Masthead`)**:
  - 상단 헤더(`AppHeader`)에는 정중앙의 `MOONTOMI` 제호와 부제만 배치하며, 우측에 로그인 버튼 등 비대칭 요소를 추가하지 않습니다.
  - 멤버 로그인·계정 전환 및 새 소식 알림 진입점은 **데스크톱 좌측 사이드바 하단 버튼**과 **모바일 하단 6열 탭바(6번째 탭)**로 일원화합니다.
- **칩/배지 내 텍스트 수직 중앙 보정 (`Optical Chip Centering`)**:
  - `LINE Seed KR` 및 `Nohemi` 폰트는 균등 상하 패딩(`py-*`) 적용 시 텍스트가 위로 치우쳐 보입니다.
  - 모든 소형 칩과 배지는 `leading-none`과 함께 상단 패딩을 하단보다 약간 더 주거나(`pt-[3.5px] pb-[2px]`, `pt-[6px] pb-[4px]`), 내부 텍스트에 `translate-y-[0.5px]`~`translate-y-[1px]`을 적용해 시각적 수직 중앙을 맞추세요.
- **로딩 프로그레스 도넛 크기 통일**:
  - 모든 페이지와 모달, `InfiniteScrollSentinel`의 로딩 스피너(`Loader2`)는 반드시 **`w-8 h-8 animate-spin text-[#ff8080]` (`32px`)**로 통일합니다.
  - 한 화면에서 상단 상태줄의 작은 스피너(`w-3.5`/`w-4`)와 본문 스피너가 동시에 중복 회전하지 않도록 단일 스피너만 노출합니다.
- **브라우저 기본 `alert()` 사용 금지**:
  - 안내 및 경고 메시지는 네이티브 `window.alert()` 대신 언제나 `useMemberAuth().showAlert({ title, message, onConfirm })` 자체 모달을 사용합니다.
- **여백 및 문구 절제**:
  - 홈 화면 상단 Hall of Fame 캐러셀 위의 여백은 타이트하게(`PageContainer`에 `pt-2 sm:pt-3`, 캐러셀 `pt-1 pb-4`) 유지합니다.
  - 상단 페이지 헤더에 이미 설명글이 있는 경우(예: `/lookup`), 하단 컨트롤 영역에 불필요한 중복 안내 문구를 반복해서 적지 않습니다.
  - 한글 본문 및 모달 메시지에는 `break-keep`(`word-break: keep-all`)을 적용하고, 에디토리얼 본문(`.editorial-prose`)에는 가로 오버플로우 방지(`overflow-wrap: anywhere`, `overflow-x: hidden`)를 유지합니다.

---

## 3. 검증 및 배포
- 코드 수정 후에는 항상 `npx tsc --noEmit`으로 타입 에러가 없는지 확인합니다.
- 배포 요청 시 변경된 파일을 커밋하고 `git push origin main`을 통해 Vercel 자동 배포를 트리거합니다.
