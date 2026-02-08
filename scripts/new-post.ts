import fs from "node:fs";
import path from "node:path";
import { slugify } from "../lib/slug";

type Status = "draft" | "published";

interface Args {
  topic?: string;
  title?: string;
  tags: string[];
  status: Status;
  validateOnly: boolean;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);

  const read = (name: string): string | undefined => {
    const i = args.indexOf(name);
    if (i === -1) return undefined;
    return args[i + 1];
  };

  const topic = read("--topic");
  const title = read("--title");
  const tags = (read("--tags") ?? "engineering").split(",").map((x) => x.trim()).filter(Boolean);
  const statusRaw = (read("--status") ?? "published") as Status;
  const status = statusRaw === "draft" ? "draft" : "published";
  const validateOnly = args.includes("--validate");

  return { topic, title, tags, status, validateOnly };
}

function todayKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function suggestTitles(topic: string): string[] {
  return [
    `${topic}: 실무 적용 전에 확인할 5가지`,
    `${topic} 도입기: 시행착오와 선택 기준`,
    `${topic}로 생산성 올리기: 팀 운영 관점`,
    `${topic} 트러블슈팅: 자주 막히는 지점 정리`,
    `${topic}를 장기적으로 쓰기 위한 운영 원칙`,
  ];
}

function makeTemplate(params: {
  title: string;
  description: string;
  date: string;
  tags: string[];
  status: Status;
  topic: string;
}): string {
  const tagsYaml = `[${params.tags.map((t) => `"${t}"`).join(", ")}]`;

  return `---
title: "${params.title}"
description: "${params.description}"
date: "${params.date}"
tags: ${tagsYaml}
series: ""
status: "${params.status}"
---

## 왜 이 주제를 지금 다루는가
현업에서 ${params.topic}를 검토할 때 가장 먼저 부딪히는 제약을 정리한다.

## 실제 적용 절차
### 1) 현재 상태 진단
현재 시스템에서 변경 영향도를 먼저 파악한다.

### 2) 작은 범위로 검증
운영 경로를 건드리기 전에 PoC를 통해 실패 비용을 제한한다.

### 3) 운영 반영 기준 확정
성능, 장애 대응, 협업 비용 기준을 문서로 고정한다.

## 자주 발생하는 문제와 대응
실패 패턴을 사전에 정의하고, 롤백 절차를 간단히 유지한다.

## 요약
핵심은 기술 자체보다 팀에서 반복 가능한 운영 방식이다.

## FAQ
### Q. 처음부터 전면 도입해야 하나?
A. 아니다. 영향도가 작은 경로부터 점진적으로 확장하는 편이 안전하다.

## 다음 글 추천
- [운영 자동화 체크리스트](/posts/operations-automation-checklist)
`;
}

function validateFrontmatter(raw: string): string[] {
  const required = ["title:", "description:", "date:", "tags:", "status:"];
  const errors: string[] = [];

  for (const key of required) {
    if (!raw.includes(key)) {
      errors.push(`Missing frontmatter field: ${key.replace(":", "")}`);
    }
  }

  return errors;
}

function run(): void {
  const args = parseArgs();

  if (args.validateOnly) {
    const root = path.join(process.cwd(), "content", "posts");
    const files: string[] = [];

    const walk = (dir: string): void => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full);
        else if (full.endsWith(".md") || full.endsWith(".mdx")) files.push(full);
      }
    };

    walk(root);

    const allErrors: string[] = [];
    for (const file of files) {
      const raw = fs.readFileSync(file, "utf8");
      const errors = validateFrontmatter(raw);
      allErrors.push(...errors.map((e) => `${file}: ${e}`));
    }

    if (allErrors.length) {
      console.error(allErrors.join("\n"));
      process.exit(1);
    }

    console.log(`Validated ${files.length} posts`);
    return;
  }

  if (!args.topic && !args.title) {
    console.error("Usage: npm run post:create -- --topic \"주제\" [--title \"제목\"] [--tags \"a,b\"] [--status draft|published]");
    process.exit(1);
  }

  const topic = args.topic ?? args.title ?? "새 글";
  const titles = suggestTitles(topic);
  const selectedTitle = args.title ?? titles[0];
  const date = todayKST();
  const year = date.slice(0, 4);
  const slug = slugify(selectedTitle);

  const dir = path.join(process.cwd(), "content", "posts", year);
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${date}-${slug}.mdx`);
  if (fs.existsSync(filePath)) {
    console.error(`이미 존재하는 파일입니다: ${filePath}`);
    process.exit(1);
  }

  const description = `${topic}를 실무 관점에서 적용할 때 필요한 기준과 운영 포인트를 정리한다.`;
  const content = makeTemplate({
    title: selectedTitle,
    description,
    date,
    tags: args.tags,
    status: args.status,
    topic,
  });

  fs.writeFileSync(filePath, content, "utf8");

  console.log("생성 완료");
  console.log(`- file: ${filePath}`);
  console.log("- title suggestions:");
  titles.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
}

run();
