---
name: MOONTOMI
description: 문형규의 토요일, 음악에 미치는 날 — 대중 음악의 이해
colors:
  midnight-slate: "#242d3c"
  coral-pulse: "#ff8080"
  alice-mist: "#f0f8ff"
  warm-gold: "#ffb400"
  silver-track: "#4a4f5a"
  bronze-track: "#6e3732"
  surface-white: "#ffffff"
  surface-subtle: "#f3f3f3"
  border-muted: "#bdc0c4"
  ink-primary: "#171717"
  ink-muted: "#808080"
typography:
  display:
    fontFamily: "Bayaters Stamp, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 400
    lineHeight: 1.1
  display-shrunk:
    fontFamily: "Bayaters Stamp, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.1
  headline:
    fontFamily: "Nanum Myeongjo, serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.35
  title:
    fontFamily: "Nohemi, LINE Seed, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "LINE Seed, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  subtitle:
    fontFamily: "LINE Seed, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
  label:
    fontFamily: "Nohemi, LINE Seed, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.04em"
rounded:
  sm: "7px"
  md: "14px"
  lg: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.coral-pulse}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.midnight-slate}"
    textColor: "{colors.alice-mist}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  card-comment:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "16px 24px"
  modal-dialog:
    backgroundColor: "{colors.surface-white}"
    borderColor: "{colors.midnight-slate}"
    headerBackgroundColor: "{colors.midnight-slate}"
    headerTextColor: "{colors.alice-mist}"
    rounded: "{rounded.md}"
---

# Design System: MOONTOMI

## Overview

**Creative North Star: "The Saturday Listening Room (토요일의 음감실)"**

MOONTOMI의 시각 시스템은 레코드 숍의 스탬프가 찍힌 아날로그 감성과 현대적인 웹 매거진의 단정함을 결합합니다. 상단과 하단을 단단하게 잡아주는 미드나잇 네이비(`#242d3c`) 프레임 안에서, 밝고 깨끗한 화이트 캔버스 위에 앨범 아트워크와 음악 비평 텍스트가 선명하게 드러납니다.

각 섹션은 성격에 맞는 고유한 타이포그래피 목소리를 가집니다. 헤더의 빈티지 스탬프 서체(`Bayaters Stamp`), 본문의 정갈한 산세리프(`LINE Seed KR`), 음평회 점수의 경쾌한 스크립트(`Lobster`), 칼럼의 문학적인 명조(`Nanum Myeongjo ExtraBold`), 그리고 아카이브의 모던 지오메트릭 산세리프(`Nohemi`)가 각자의 자리에서 조화를 이룹니다.

**Key Characteristics:**
- **Symmetrical Masthead & Framed Canvas**: 상단 고정 헤더(스크롤 시 `90px` → `52px` 축소)는 우측 버튼 등의 비대칭 요소를 배제하고 정중앙에 `MOONTOMI` 제호만 배치해 매거진 제호로서의 대칭미를 유지합니다. 데스크톱 좌측 호버 확장형 레일 네비게이션(`75px` → `240px`)과 모바일 하단 고정 6열 탭바(`56px`)가 콘텐츠 영역을 액자처럼 감쌉니다.
- **Tactile Album Focus**: 홈 화면의 Hall of Fame 캐러셀은 상단 여백을 타이트하게(`pt-2 sm:pt-3`, 캐러셀 `pt-1 pb-4`) 당겨 첫인상부터 앨범 커버 아트워크가 중심 시각 요소로 작동하게 합니다.
- **Ceremonial Rating Display**: 음평회 평점, 베스트 트랙(골드/실버/브론즈), 오픈 전 블라인드 상태(`Open?` 타이틀 및 자물쇠 열림 애니메이션)를 명확한 시각적 위계로 표현합니다.

## Colors

깊은 밤하늘 같은 네이비(`#242d3c`)와 따뜻한 코랄 핑크(`#ff8080`)의 대비를 중심으로, 앨범 커버의 다채로운 색감이 방해받지 않도록 본문 배경은 순백색을 유지합니다.

### Primary
- **Midnight Slate** (`#242d3c`): 상단 헤더, 하단 푸터/모바일 탭바, 모달 헤더, 아카이브 고정 배너 배경, 주요 타이틀 및 기본 아이콘 컬러로 사용되어 브랜드의 무게중심을 잡습니다.
- **Coral Pulse** (`#ff8080`): 활성 네비게이션 상태, 미열람 새 소식 레드닷(Red Dot) 배지, 주요 액션 아이콘 포인트, 음평회 상세 별점 하이라이트, 로딩 프로그레스 도넛(`w-8 h-8`)에 사용되는 핵심 포인트 컬러입니다.

### Secondary
- **Warm Gold** (`#ffb400`): 아카이브 및 한줄평 별점과 베스트 트랙 1위 표기에 사용됩니다.
- **Silver Track** (`#4a4f5a`): 한줄평 베스트 트랙 2위 표기에 사용됩니다.
- **Bronze Track** (`#6e3732`): 한줄평 베스트 트랙 3위 표기에 사용됩니다.
- **Archive Type Accent**: 홈 화면 `Archive Curate`(`LatestArchiveSection`) 및 아카이브 스테이션(`ArchiveGridTile`, `ArchiveDetailBanner`, `ArchiveListItem`) 전반에서 `ALBUM` 배지는 에메랄드 그린(`border-green-400 text-green-300`), `SINGLE` 배지는 앰버 오렌지(`border-orange-400 text-orange-300`) 기조로 통일합니다.

### Neutral
- **Surface White** (`#ffffff`): 기본 페이지 및 카드 배경색입니다.
- **Alice Mist** (`#f0f8ff`): Midnight Slate(`#242d3c`) 서피스 위에 올라가는 헤더/푸터/모달 헤더 텍스트 컬러입니다.
- **Surface Subtle** (`#f3f3f3`): 한줄평 작성 버튼(`POST YOUR COMMENT`), 비활성 필터 칩 및 보조 입력 서피스 배경색입니다.
- **Border Muted** (`#bdc0c4`): 칼럼 카드 및 한줄평 카드의 외곽선 컬러입니다.
- **Ink Primary** (`#171717`) / **Ink Muted** (`#808080`): 기본 본문 텍스트 및 날짜·조회수 등 보조 메타데이터 컬러입니다.

### Named Rules
**The Two-Tone Anchor Rule.** 브랜드 컬러는 언제나 Midnight Slate(`#242d3c`)가 구조(프레임)를 맡고 Coral Pulse(`#ff8080`)가 액션, 레드닷 알림, 하이라이트를 맡는다. 임의의 블루/퍼플 그라데이션을 절대 섞지 않는다.

## Typography

**Display Font:** `Bayaters Stamp` (with `sans-serif` fallback)
**Body Font:** `LINE Seed KR` (with `sans-serif` fallback)
**Editorial Headline Font:** `Nanum Myeongjo ExtraBold` (with `serif` fallback)
**Numeric Score Font:** `Lobster` (with `cursive` fallback)
**Archive Meta Font:** `Nohemi` (`Medium` 500 / `Bold` 700)

**Character:** 정갈하고 가독성 높은 `LINE Seed KR`를 기본 골격으로 삼고, 각 콘텐츠의 성격(점수, 칼럼 제목, 아카이브 메타데이터)에 맞춰 개성 있는 디스플레이 서체를 핀포인트로 배치합니다.

### Hierarchy
- **Display** (`400`, `2.5rem` / 스크롤 축소 시 `1.875rem`, `line-height: 1.1`): 상단 헤더 워드마크(`MOONTOMI`) 및 메인 섹션 타이틀에 사용합니다.
- **Headline** (`800`, `clamp(1.25rem, 2vw, 1.5rem)`, `line-height: 1.35`): 칼럼 목록 및 칼럼 상세의 인용구형 제목(`Nanum Myeongjo`)에 사용합니다.
- **Title** (`700`, `clamp(1rem, 2vw, 1.375rem)`, `line-height: 1.3`): 음평회 앨범명 및 아카이브 선택 앨범 타이틀에 사용합니다.
- **Body** (`400`, `1rem`, `line-height: 1.6`, `65ch` 내외): 한줄평 본문(`word-break: keep-all`) 및 칼럼 본문(`.editorial-prose`, 가로 오버플로우 방지 적용)에 사용합니다.
- **Label** (`700`, `0.75rem`, `letter-spacing: 0.04em`, `uppercase`): `ALBUM` / `SINGLE` 타입 칩, 알림 카테고리 태그(`음평회`, `칼럼`, `아카이브`), 장르 및 시즌 태그에 사용합니다.

### Named Rules
- **The Role-Bound Typeface Rule.** 서체는 지정된 역할에만 사용한다: `Lobster`는 오직 평점 숫자에만, `Nanum Myeongjo`는 칼럼 타이틀과 필진 표기에만, `Bayaters Stamp`는 브랜드 헤더에만 사용한다.
- **The Optical Chip Centering Rule.** `LINE Seed KR` 및 `Nohemi` 서체는 베이스라인 하단 여백이 커서 소형 칩/배지에 균등 상하 패딩(`py-*`)을 주면 글자가 위로 쏠려 보인다. 따라서 칩/배지 내부 텍스트는 `leading-none`과 함께 상단 패딩을 하단보다 약간 더 주거나(`pt-[3.5px] pb-[2px]`, `pt-[6px] pb-[4px]`), 텍스트 래퍼에 `translate-y-[0.5px]`~`translate-y-[1px]`을 적용해 시각적 정중앙을 맞춘다.

## Layout

- **App Frame**:
  - **Top Header**: 정중앙 `MOONTOMI` 제호만 담는 대칭 헤더(`height: 90px`, 스크롤 50px 초과 시 `52px`로 축소).
  - **Desktop Navigation (`>= 768px`)**: 좌측 `75px` 폭의 고정 레일(호버 시 `240px` 확장). 상단에는 5개 주요 메뉴(`HOME`, `칼럼`, `음평회`, `둘러보기`, `아카이브`), 하단에는 **멤버 & 최근 소식 허브 버튼**(미열람 소식 존재 시 레드닷 및 개수 배지 표시)이 위치합니다.
  - **Mobile Navigation (`< 768px`)**: 하단 고정 6열 탭바(`height: 56px`, 5개 주요 메뉴 + 6번째 `로그인/멤버명` 탭 및 레드닷 배지).
- **Content Containers (`PageContainer`)**:
  - 공통: `html`, `body`, `AppShell`의 `<main>`, `PageContainer`에 `min-w-0 max-w-full overflow-x-clip`을 적용하여 모바일 뷰포트(`100vw`) 초과 및 줌아웃 현상을 방지합니다.
  - `wide` (`max-w-[1160px]`): 홈 화면 (`pt-2 sm:pt-3`으로 상단 여백 최소화)
  - `archive` (`max-w-[1080px]`): 아카이브 브라우저 (데스크톱 좌측 스티키 상세 배너 + 우측 검색/별점 범위 `0.0~5.0` 필터 및 리스트·그리드, 모바일 상단 접이식 미니 플레이어 및 `공유` 버튼 우측 투고일 표기)
  - `reading` (`max-w-[820px]`): 음평회 목록/상세, 칼럼 목록/상세(`.editorial-prose` 내 인라인 이미지 `max-width: calc(100% - 24px)` 및 모바일 좌우 마진 `0` 적용), 한줄평 둘러보기(`LookupCommentRow` 이탤릭 앨범명 우측 잘림 방지 `pr-1.5`)
  - `form` (`max-w-[640px]`): 한줄평 작성 및 수정 폼 (`emoji-picker-react` 이모지 선택기 포함)

## Components

### Buttons & Controls
- **Shape:** 부드러운 모서리(`7px` radius), 한줄평 포스트 버튼은 카드와 동일한 `20px` radius.
- **Sort & Filter Toggles:** 정렬 옵션 토글 그룹은 `7px` 라운드 컨테이너 내 분할 보더(`divide-x divide-[#bdc0c4]`)를 사용하며 활성 상태에 Midnight Slate(`#242d3c`) 배경과 화이트 텍스트를 적용합니다.
- **Archive Rating Range Filter:** 아카이브 별점 필터는 `0.0점`~`5.0점`(`0.5점` 단위) 최소·최대 2단 `<select>`로 구성하며, 역전 방지 자동 보정 및 `전체 초기화` 버튼을 제공합니다.

### Chips & Badges
- **Optical Alignment:** 모든 소형 칩(알림센터 필터 칩, 카테고리 배지, 아카이브 `ALBUM`/`SINGLE` 배지, 안 읽은 알림 수 배지)은 상하 비대칭 패딩(`pt > pb`) 또는 미세 Y축 이동(`translate-y-[0.5px]`)으로 텍스트가 칩의 수직 정중앙에 위치하도록 보정합니다.
- **Notification Red Dot:** 읽지 않은 새 컨텐츠(`새 음평회`, `새 칼럼`, `새 아카이브`)가 있을 때 네비게이션의 멤버 아이콘 우측 상단과 알림 리스트 항목 우측에 `bg-[#ff8080]` 원형 도트를 표시합니다.

### Modals (Member Hub & Custom Alert)
- **Unified Modal Frame:** 모든 모달(멤버 & 최근 소식 허브, 멤버 선택 모달, 전역 알림 모달 `showAlert`)은 반투명 블러 백드롭(`bg-black/50 backdrop-blur-[2px]`), `14px` 라운드 화이트 카드, `1px solid #242d3c` 보더, 그리고 Midnight Slate(`#242d3c`) 상단 헤더 바(`#ff8080` 포인트 아이콘 + 타이틀 + 닫기 버튼)를 공통 규격으로 사용합니다.
- **No Native Alerts:** 브라우저 기본 `window.alert()`는 절대 사용하지 않으며, 반드시 `useMemberAuth().showAlert()` 커스텀 모달을 통해 안내 메시지를 표시합니다.

### Loading Indicator (Progress Donut)
- **Unified Size:** 모든 페이지(홈 초기 로딩, 음평회 목록/상세, 칼럼 목록/상세, 둘러보기 목록/모달, 아카이브 목록, 작성/수정 폼, `InfiniteScrollSentinel`)의 로딩 스피너(`Loader2`)는 **`w-8 h-8` (`32px`, `animate-spin text-[#ff8080]`)** 단일 크기로 통일합니다.
- **Single Spinner Per View:** 로딩 중 상태바에 별도의 작은 스피너(`w-3.5`/`w-4`)를 중복 노출하지 않고, 컨텐츠 영역 중앙의 `w-8 h-8` 프로그레스 도넛 하나만 깔끔하게 표시합니다.

## Do's and Don'ts

### Do:
- **Do** 상단 헤더(`AppHeader`)는 중앙 제호의 대칭 균형을 위해 우측에 버튼을 추가하지 말고, 계정 및 알림 진입점은 네비게이션(좌측 레일 하단 / 모바일 하단 탭바)으로 일원화하세요.
- **Do** 한글 본문과 안내 모달에는 항상 `word-break: keep-all`(`break-keep`)을 적용하고, 에디토리얼 본문(`.editorial-prose`)에는 `overflow-wrap: anywhere`와 `overflow-x: hidden`을 함께 적용해 긴 URL이나 텍스트로 인한 가로 스크롤 발생을 방지하세요.
- **Do** 상단 페이지 헤더에 이미 설명글이 존재하는 경우(예: `/lookup`), 하단 컨트롤 영역에 중복된 안내 문구를 반복하지 마세요.
- **Do** 모든 페이지의 로딩 프로그레스 도넛 크기를 `w-8 h-8`로 동일하게 유지하고, 안내 팝업은 `showAlert` 자체 모달을 사용하세요.

### Don't:
- **Don't** 브랜드 컬러인 `#242d3c`와 `#ff8080` 외에 임의의 네온 컬러나 보라색 그라데이션을 사용하지 마세요.
- **Don't** 브라우저 기본 `alert()`를 호출하여 사이트의 디자인 일관성을 깨뜨리지 마세요.
- **Don't** 소형 칩/배지 내부 텍스트가 위쪽으로 쏠린 채 방치하지 마세요 (`Optical Chip Centering Rule` 준수).
