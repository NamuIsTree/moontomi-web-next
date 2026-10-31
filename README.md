# MOONTOMI Web Next

**문형규의 토요일, 음악에 미치는 날 (대중 음악의 이해)** — Next.js (App Router) + Supabase Serverless 웹 애플리케이션입니다.

## 주요 기술 스택
- **Framework**: Next.js (App Router, TypeScript)
- **Styling & UI**: Tailwind CSS v4 + Lucide Icons
- **Backend / Database**: Supabase (PostgreSQL, Row Level Security, RPC Functions, Storage)
- **Brand Colors**:
  - Primary Navy: `#242d3c`
  - Accent Coral: `#ff8080`

## 데이터베이스 구조 (`public`)
- `artist`, `genre`, `season`, `archive`
- `album`, `album_genre`, `single`, `single_genre`
- `lecture` (음평회), `comment` (한줄평)
- `review` (칼럼/투고)
- 모든 테이블에 `created_at`, `modified_at` (Nullable, 신규 생성 시 `now()` 기본값 및 `UPDATE` 시 자동 갱신 트리거 적용)

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
