# 주제만 던져서 글 추가하는 방법

1. 주제를 정한다: 예) `주제: Next.js 서버 액션 운영 패턴`
2. 글 생성 스크립트를 실행한다.
   - 제목까지 자동 기본값으로 생성:
     - `npm run post:create -- --topic "Next.js 서버 액션 운영 패턴"`
   - 제목을 직접 지정:
     - `npm run post:create -- --topic "Next.js 서버 액션 운영 패턴" --title "Next.js 서버 액션, 운영에서 안 깨지게 쓰는 방법"`
3. 생성된 파일(`content/posts/YYYY/YYYY-MM-DD-*.mdx`)을 열어 본문을 확정한다.
4. 검증 후 커밋/푸시한다.
   - `npm run check:content`
   - `npm run typecheck`
   - `npm run build`

---

## 프로젝트 개요

- Next.js(App Router) + TypeScript
- 파일 기반 MDX 콘텐츠(`content/posts`)
- 코드 하이라이트(`rehype-pretty-code`)
- RSS(`app/rss.xml/route.ts`) + sitemap(`app/sitemap.ts`)
- Git 기반 운영(별도 DB 없음)

## 폴더 구조

```txt
/
  app/
  components/
  content/
    posts/
      2026/
        2026-02-08-some-slug.mdx
  lib/
    posts.ts
    slug.ts
  public/
  scripts/
    new-post.ts
  PROMPTS/
    editorial_team.md
  .github/workflows/
  package.json
  tailwind.config.ts
  next.config.ts
```

## 설치 및 실행

```bash
npm install
npm run dev
```

- 개발 서버: `http://localhost:3000`

## 글 규격(frontmatter)

```yaml
---
title: "문서 제목"
description: "1~2문장 요약"
date: "2026-02-08"
tags: ["react", "nextjs"]
series: "선택"
status: "draft|published"
---
```

- `status: "draft"` 글은 목록에서 제외된다.

## 배포(Vercel)

1. GitHub에 푸시한다.
2. Vercel에서 Repository Import.
3. 환경변수 설정(선택):
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
4. 필요 시 커스텀 도메인 연결.

## Cloudflare Pages 대안

1. GitHub 연결 후 Framework preset을 `Next.js`로 선택.
2. 빌드 명령: `npm run build`
3. 환경변수에 `NEXT_PUBLIC_SITE_URL` 추가.

## 자동 업데이트 운영 루프

1. 주제 입력
2. `scripts/new-post.ts`로 초안 파일 생성
3. 글 편집팀 프롬프트(`PROMPTS/editorial_team.md`) 기준으로 원고 완성
4. `main` 반영 시 CI 빌드 통과 후 자동 배포
