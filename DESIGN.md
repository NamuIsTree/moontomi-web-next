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
  md: "12px"
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
---

# Design System: MOONTOMI

## Overview

**Creative North Star: "The Saturday Listening Room (토요일의 음감실)"**

MOONTOMI의 시각 시스템은 레코드 숍의 스탬프가 찍힌 아날로그 감성과 현대적인 웹 매거진의 단정함을 결합합니다. 상단과 하단을 단단하게 잡아주는 미드나잇 네이비(`#242d3c`) 프레임 안에서, 밝고 깨끗한 화이트 캔버스 위에 앨범 아트워크와 음악 비평 텍스트가 선명하게 드러납니다.

각 섹션은 성격에 맞는 고유한 타이포그래피 목소리를 가집니다. 헤더의 빈티지 스탬프 서체(`Bayaters Stamp`), 본문의 정갈한 산세리프(`LINE Seed KR`), 음평회 점수의 경쾌한 스크립트(`Lobster`), 칼럼의 문학적인 명조(`Nanum Myeongjo ExtraBold`), 그리고 아카이브의 모던 지오메트릭 산세리프(`Nohemi`)가 각자의 자리에서 조화를 이룹니다.

**Key Characteristics:**
- **Framed Canvas**: 상단 고정 헤더(스크롤 시 90px → 50px 축소)와 좌측 호버 확장형 레일 네비게이션(75px → 240px), 하단 고정 푸터가 콘텐츠 영역을 액자처럼 감쌉니다.
- **Tactile Album Focus**: 앨범 커버 이미지가 카드, 캐러셀, 상단 프리뷰 배너의 중심 시각 요소로 작동합니다.
- **Ceremonial Rating Display**: 음평회 평점, 베스트 트랙(골드/실버/브론즈), 오픈 전 블라인드 상태(`OPEN` 칩 및 회전 기어 아이콘)를 명확한 시각적 위계로 표현합니다.

## Colors

깊은 밤하늘 같은 네이비(`#242d3c`)와 따뜻한 코랄 핑크(`#ff8080`)의 대비를 중심으로, 앨범 커버의 다채로운 색감이 방해받지 않도록 본문 배경은 순백색을 유지합니다.

### Primary
- **Midnight Slate** (`#242d3c`): 상단 헤더, 하단 푸터, 아카이브 고정 배너 배경, 주요 타이틀 및 기본 아이콘 컬러로 사용되어 브랜드의 무게중심을 잡습니다.
- **Coral Pulse** (`#ff8080`): 활성 네비게이션 상태, 주요 제출/업로드 버튼, 음평회 상세 별점 하이라이트, 로딩 인디케이터에 사용되는 핵심 포인트 컬러입니다.

### Secondary
- **Warm Gold** (`#ffb400`): 아카이브 및 한줄평 별점(`v-rating`)과 베스트 트랙 1위 표기에 사용됩니다.
- **Silver Track** (`#4a4f5a`): 한줄평 베스트 트랙 2위 표기에 사용됩니다.
- **Bronze Track** (`#6e3732`): 한줄평 베스트 트랙 3위 표기에 사용됩니다.

### Neutral
- **Surface White** (`#ffffff`): 기본 페이지 및 카드 배경색입니다.
- **Alice Mist** (`#f0f8ff`): Midnight Slate(`#242d3c`) 서피스 위에 올라가는 헤더/푸터 텍스트 컬러입니다.
- **Surface Subtle** (`#f3f3f3`): 한줄평 작성 버튼(`POST YOUR COMMENT`) 및 보조 입력 서피스 배경색입니다.
- **Border Muted** (`#bdc0c4`): 칼럼 카드 및 한줄평 카드의 외곽선 컬러입니다.
- **Ink Primary** (`#171717`) / **Ink Muted** (`#808080`): 기본 본문 텍스트 및 날짜·조회수 등 보조 메타데이터 컬러입니다.

### Named Rules
**The Two-Tone Anchor Rule.** 브랜드 컬러는 언제나 Midnight Slate(`#242d3c`)가 구조(프레임)를 맡고 Coral Pulse(`#ff8080`)가 액션과 하이라이트를 맡는다. 임의의 블루/퍼플 그라데이션을 절대 섞지 않는다.

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
- **Body** (`400`, `1rem`, `line-height: 1.6`, `65ch` 내외): 한줄평 본문(`word-break: keep-all`, `white-space: pre-line`) 및 칼럼 본문에 사용합니다.
- **Label** (`700`, `0.75rem`, `letter-spacing: 0.04em`, `uppercase`): `ALBUM` / `SINGLE` 타입 칩, `OPEN` 배지, 장르 및 시즌 태그에 사용합니다.

### Named Rules
**The Role-Bound Typeface Rule.** 서체는 지정된 역할에만 사용한다: `Lobster`는 오직 평점 숫자에만, `Nanum Myeongjo`는 칼럼 타이틀과 필진 표기에만, `Bayaters Stamp`는 브랜드 헤더에만 사용한다.

## Layout

- **App Frame**: 상단 고정 헤더(`height: 90px`, 스크롤 50px 초과 시 `50px`로 축소)와 하단 고정 푸터가 존재하며, 데스크톱(`>= 768px`)에서는 좌측에 `75px` 폭의 고정 네비게이션 레일이 배치되어 호버 시 `240px`로 부드럽게 확장됩니다.
- **Content Containers**:
  - 홈 화면: 최대 폭 `1000px ~ 1200px` 중앙 정렬
  - 음평회 / 칼럼 목록 및 상세: 데스크톱 기준 `768px` 중심의 읽기 편한 단일 컬럼 레이아웃
  - 아카이브: 데스크톱(`>= 1280px`) `1064px`, 태블릿(`768px ~ 1279px`) `640px`, 모바일(`< 768px`) `340px` 컨테이너와 상단 고정 프리뷰 배너 + 하단 정사각형 그리드 구조

## Elevation & Depth

기본 서피스는 평면(Flat)과 얇은 보더(`1px solid #bdc0c4`)를 중심으로 구성되며, 스크롤 위에 떠 있는 아카이브 상단 상세 배너와 호버된 카드에만 절제된 그림자와 스케일/클리핑 트랜지션을 부여합니다.

## Shapes

- **Cards & Sheets**:
  - 한줄평 카드(`comment-card`): 넉넉한 라운드 코너(`20px`)와 `1px solid #bdc0c4` 보더
  - 칼럼 리스트 카드(`review-sheet`): 우측/하단 보더 강조(`7px` 라운드)와 썸네일 이미지의 사선 폴리곤 클리핑(`clip-path: polygon(0 0, 95% 0, 90% 100%, 0 100%)`, 호버 시 `85% / 75%`로 역동적 전환)
  - 아카이브 배너: `7px` 라운드 코너와 은은한 다크 슬레이트 쉬머(`linear-gradient(-45deg, rgba(36, 45, 60, 0.8)...)`) 배경

## Components

### Buttons
- **Shape:** 부드러운 모서리(`7px` radius), 한줄평 포스트 버튼은 카드와 동일한 `20px` radius
- **Primary:** Coral Pulse(`#ff8080`) 배경에 화이트 텍스트, 대문자 레이블(`UPLOAD`, `평가 수정`)
- **Secondary / Toggle:** 정렬 옵션 토글 버튼 그룹은 직각형(`0px` radius) 아웃라인 보더를 사용하며 활성 상태에 Midnight Slate(`#242d3c`) 배경과 화이트 텍스트를 적용합니다.

### Chips
- **Style:** 장르 칩(`장르명 | 카테고리`), 시즌 라벨 칩, 그리고 아카이브의 `ALBUM`(그린 아웃라인) / `SINGLE`(오렌지 아웃라인) 배지로 구분됩니다.

### Cards / Containers
- **Corner Style:** 한줄평 카드는 `20px`, 칼럼 및 아카이브 카드는 `7px`
- **Background:** 순백색(`#ffffff`), 아카이브 프리뷰 카드는 다크 슬레이트 반투명 그라데이션(`rgba(36, 45, 60, 0.8)`)

### Navigation
- **Desktop:** 좌측 고정 레일(`75px` 기본, 마우스 호버 시 `240px` 확장), 상단 스크롤과 연동되어 헤더 높이가 함께 축소(`90px` → `50px`)
- **Mobile (`< 768px`):** 좌측 레일이 숨겨지고 하단 푸터(`🧭 NAVIGATION`)를 탭하면 좌측 드로어 메뉴가 열립니다.

## Do's and Don'ts

### Do:
- **Do** 한글 본문과 한줄평에는 항상 `word-break: keep-all`을 적용하여 단어 중간이 끊어지지 않게 유지하세요.
- **Do** 음평회 상세에서 아직 공개 전(`rating === null`)인 경우 평점 대신 `OPEN` 상태와 블라인드 처리된 한줄평(회전 기어 애니메이션 및 개별 토글 버튼)을 표시하세요.
- **Do** 헤더의 스크롤 축소(`scrollTop > 50`일 때 `90px` → `50px`)와 데스크톱 좌측 레일 여백(`75px`)의 공간적 일관성을 모든 페이지에서 유지하세요.

### Don't:
- **Don't** 브랜드 컬러인 `#242d3c`와 `#ff8080` 외에 임의의 네온 컬러나 AI 기본 보라색 그라데이션을 사용하지 마세요.
- **Don't** 평점 표기용 서체인 `Lobster`를 일반 본문이나 버튼 텍스트에 사용하지 마세요.
- **Don't** 카드 안에 또 다른 박스형 카드를 중첩(Nested Cards)하여 화면을 답답하게 만들지 마세요.
