# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

음악 감상 및 음평회(음악 평가 모임) 멤버들과 방문자들.
- **모임 멤버**: 매주 선정된 음평회 앨범을 감상한 뒤 평점(0~100점 스케일, 10.0 만점 표기), 베스트 트랙 3곡, 한줄평을 남기고, 결산·칼럼·잡설 등의 음악 원고를 투고하거나 추천 앨범/싱글 아카이브를 등록한다.
- **방문자 및 독자**: 명예의 전당(Hall of Fame) / 수치의 전당(Hall of Shame) 앨범과 최신 음평회 결과를 둘러보고, 멤버별 한줄평을 검색(`둘러보기`)하거나 아카이브의 YouTube/Spotify 임베드를 통해 음악을 감상한다.

## Product Purpose

**MOONTOMI (문형규의 토요일, 음악에 미치는 날 — 대중 음악의 이해)**는 매주 진행되는 앨범 음평회의 기록과 평점, 한줄평, 음악 칼럼, 그리고 엄선된 앨범/싱글 아카이브를 한곳에 축적하고 공유하는 음악 비평 커뮤니티 웹 매거진이다.

## Positioning

단순한 별점 사이트나 개인 블로그가 아니라, **"블라인드 평가 후 동시 공개(Open)되는 회차별 음평회"**라는 고유한 리추얼을 중심으로 작동한다:
- 음평회가 열려 있는 동안(`rating = null`, `OPEN` 상태)에는 각 멤버가 남긴 점수와 한줄평이 톱니바퀴 애니메이션 뒤에 가려져 있다가, 음평회가 마감·공개되는 순간 전체 평균 평점(소수점 1자리 및 호버 시 3자리)과 모든 한줄평·베스트 트랙이 함께 공개된다.
- 컴필레이션 시즌(`season_id = 8`)은 평점 랭킹에서 제외하는 등 모임 고유의 규칙과 히스토리가 반영되어 있다.

## Operating Context

- **음평회 (`Lectures`)**: 회차순/평점순(컴필레이션 제외) 정렬, 앨범 정보·장르·시즌 태그, 평균 평점 및 멤버별 베스트 트랙 1~3위(골드/실버/브론즈 컬러)와 한줄평 카드 목록.
- **한줄평 등록/수정 (`Comments`)**: 별도 회원가입 없이 닉네임과 비밀번호(해시 검증)로 참여하며, 슬라이더로 평점을 매기고 수록곡 중 베스트 1~3을 선택한다.
- **칼럼 (`Reviews`)**: 썸네일 이미지, 카테고리(`결산`, `칼럼`, `잡설`), 제목, 요약 설명, 리치 텍스트(Tiptap) 본문으로 구성된 음악 칼럼 투고 및 열람(조회수 집계).
- **둘러보기 (`Lookup`)**: 여러 작성자 닉네임 태그(칩)를 조합해 공개된 음평회의 한줄평을 모아보고 회차순/점수순으로 정렬.
- **아카이브 (`Archive`)**: 앨범/싱글 단위의 추천작 카드 그리드와 상단 고정 상세 프리뷰(YouTube/Spotify 임베드 플레이어, 별점, 공유 링크 복사).

## Capabilities and Constraints

- **Architecture**: 별도 백엔드 서버 없이 **Next.js (App Router, TypeScript) + Supabase (PostgreSQL, RLS, RPC Functions, Storage)** 서버리스 구조로 동작한다.
- **Database Audit Columns**: 모든 테이블은 `created_at`, `modified_at` (`timestamptz`, nullable — 기존 마이그레이션 데이터는 `null` 허용, 신규 생성 시 `now()` 기본값 및 수정 시 트리거 자동 갱신)을 포함한다.
- **Incumbent Design Direction**: 기존 `moontomi-web`의 레이아웃과 인터랙션 구조를 계승하면서, Impeccable을 통해 여백, 타이포그래피 위계, 반응형 완성도, 디테일 인터랙션을 세련되게 다듬는다(Refinement & Extension).

## Brand Commitments

- **브랜드 타이틀**: `MOONTOMI` / 부제: `문형규의 토요일, 음악에 미치는 날` / 푸터 슬로건: `대중 음악의 이해`
- **메인 컬러**:
  - Primary Navy: `#242d3c` (헤더, 푸터, 주요 브랜드 서피스 및 포인트)
  - Accent Coral: `#ff8080` (활성 상태, 별점/강조, 주요 CTA 버튼)
- **커스텀 타이포그래피 (`src/fonts/`)**:
  - `Bayaters Stamp`: 브랜드 워드마크(`MOONTOMI`) 및 네비게이션 헤더
  - `LINE Seed KR`: 기본 본문 및 UI 전반
  - `Lobster`: 음평회 평점 숫자 디스플레이
  - `Nanum Myeongjo ExtraBold`: 칼럼(리뷰) 제목 및 작성자 표기
  - `Nohemi (Medium / Bold)`: 아카이브 메타데이터, 배지, 영문 타이틀
  - `Roboto Mono`: 코드 및 고정폭 표기

## Evidence on Hand

- 로컬 참조 저장소: `C:\Users\user\Desktop\moontomi-web` (기존 Vue 3 프론트엔드) 및 `C:\Users\user\Desktop\moontomi-server-light` (기존 FastAPI 서버 및 DB 스키마)
- 브랜드 자산: `public/icons/`, `public/rank/translucent_1~10.png` (명예의 전당 랭킹 오버레이 숫자), `public/mock/` 샘플 이미지, `src/fonts/` 커스텀 폰트 7종

## Product Principles

1. **음평회 리추얼의 보존**: 블라인드 상태(`OPEN`)의 설렘과 공개 후 소수점 셋째 자리까지 확인하는 평점·베스트 트랙의 재미를 그대로 살린다.
2. **음악과 글이 주인공인 인터페이스**: 앨범 커버 아트워크, 한줄평 텍스트, 칼럼 본문, 스트리밍 임베드가 가장 먼저 눈에 들어오도록 시각적 노이즈를 줄인다.
3. **고유한 타이포그래피 개성 유지**: 섹션마다 부여된 서체(`Bayaters Stamp`, `LINE Seed`, `Lobster`, `Nanum Myeongjo`, `Nohemi`)의 역할을 존중하되 크기와 행간·자간을 정교하게 조율한다.
4. **가벼운 참여와 안전한 서버리스 검증**: 닉네임+비밀번호 기반의 간편한 작성 경험을 유지하면서, 비밀번호 검증과 평점 집계는 Supabase RPC 함수로 안전하게 처리한다.
