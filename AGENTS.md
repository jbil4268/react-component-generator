# AGENTS.md

## Operational Commands

- 패키지 매니저는 `bun` 고정 (`bun.lock`). npm/yarn/pnpm 사용 금지.
- 설치: `bun install`
- 개발 서버 (API 3002 + Vite 5173 동시): `bun run dev`
- API 서버만: `bun run server`
- 테스트 전체: `bun run test` (vitest run). 단일 파일: `bunx vitest run server/generator.test.ts`
- 린트: `bun run lint`
- 빌드 및 타입 검사: `bun run build` (`tsc -b && vite build`)
- 작업 완료 전 `bun run test`, `bun run lint`, `bun run build`를 통과시킨다.

## Golden Rules

### Immutable

- `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`는 서버 전용 값이다. 클라이언트 코드(`src/`)로 노출하지 않는다.
  근거: `server/index.ts:59-62`에서만 읽고, `server/index.ts:147-156`의 `/api/config`는 boolean만 반환한다.
- `.env` 파일을 읽거나 출력하거나 커밋하지 않는다. 근거: `.gitignore`에 `.env` 등록.
- 사용자가 입력한 API 키는 브라우저 `localStorage`(`apiKeys`, 프로바이더별)에만 저장하고, 서버 저장·로그·커밋 대상으로 만들지 않는다. 근거: `src/App.tsx:49`. 키는 서버로 `/api/generate` 요청 본문에만 실리며, 같은 브라우저의 XSS·확장 프로그램에 노출될 수 있다는 점을 감수한 결정이다.

### Cross-Boundary Constraints

- 생성 코드 계약은 3가지다: import 금지, 마지막에 `render(<Component />)` 호출, TypeScript 문법 금지. 근거: `server/index.ts:11-20`.
  미리보기는 `LiveProvider noInline`을 사용하므로 `render()` 호출이 없으면 아무것도 그려지지 않는다 (`src/components/LivePreview.tsx:74`, `server/generator.ts:2-3`).
  `SYSTEM_PROMPT`나 미리보기 방식을 수정할 때 서버와 프런트엔드가 이 계약을 함께 만족하는지 확인한다.
- API 포트 `3002`는 두 곳에 있다. 변경 시 함께 수정한다: `server/index.ts:139`, `vite.config.ts` proxy target.
- 테스트 설정은 `vite.config.ts`의 `test` 블록 하나다 (환경 jsdom, include: `src/**`, `server/**`). 테스트 파일은 소스 옆 `*.test.ts(x)`로 둔다.

## Project Context

- 프롬프트로 React 컴포넌트를 생성하고 react-live로 미리보기하는 웹 앱. Claude/Gemini 프로바이더 선택.
- Stack: React 19, TypeScript 5.9, Vite 8, Vitest 4, Testing Library, react-live, Bun (API 서버).

## Standards & References

- 설치/실행/기능 소개는 `README.md` 참조.
- 주석과 UI 문구, 커밋 메시지는 한국어로 작성한다.
- 커밋 메시지: `type: 요약` 형식 (feat/fix/refactor/chore/test/docs). 예: `chore: 프로젝트 초기 구성 및 React 컴포넌트 생성기 추가`.
- Maintenance Policy: 이 파일의 규칙과 실제 코드 사이에 괴리가 발견되면 작업을 마친 뒤 AGENTS.md 업데이트를 제안한다.

## Context Map

- **[API 서버 수정 (Bun)](./server/AGENTS.md)** — 프로바이더 호출, 폴백, 응답 정규화, CORS, 서버 테스트 작업 시.
- **[프런트엔드 수정 (React)](./src/AGENTS.md)** — 컴포넌트, 훅, 미리보기, 스타일, TS 설정 제약, 프런트 테스트 작업 시.
