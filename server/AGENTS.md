# server/AGENTS.md

## Module Context

Bun 런타임 API 프록시. `index.ts`가 `/api/config`, `/api/generate`를 제공하고 Anthropic/Gemini를 호출한다. 응답 정규화는 `generator.ts`, 모델 폴백은 `fallback.ts`에 분리되어 있다.

## Tech Stack & Constraints

- Bun 전용 API (`Bun.serve`, `process.env`, 전역 `fetch`)를 사용한다. 근거: `index.ts:59-62,138`. Node 전용 API나 Express 같은 서버 프레임워크를 도입하지 않는다.
- 프로바이더 SDK 없이 `fetch`로 REST를 직접 호출한다 (`index.ts:69,101`). SDK를 추가하지 않는다.
- 실행: `bun run server` (`bun --watch run server/index.ts`).

## Implementation Patterns

- 부수효과 없는 로직은 `generator.ts`, `fallback.ts`처럼 별도 모듈로 분리하고 `index.ts`에서 import한다 (`index.ts:1-2`, `generator.ts:1-2` 주석).
- 프로바이더 호출 함수는 `callXxx(prompt, apiKey): Promise<string>` 시그니처로 텍스트만 반환한다 (`index.ts:68,134`). 코드 정규화는 핸들러에서 `ensureRenderCall(stripCodeFences(text))`로 한 번만 수행한다 (`index.ts:188`).
- 모델 우선순위 목록은 파일 상단 상수에 둔다 (`GOOGLE_MODELS`, `index.ts:5`).

## Testing Strategy

- 단일 실행: `bunx vitest run server`. 테스트는 소스 옆 `*.test.ts`에 둔다.
- 테스트 대상은 순수 함수뿐이다 (`generator.test.ts`, `fallback.test.ts`). 테스트 환경은 jsdom이므로 (`vite.config.ts`) Bun 전용 API를 쓰는 코드는 import하지 않는다.
- `index.ts`는 import하는 순간 서버가 기동되므로 테스트에서 import하지 않는다.

## Local Golden Rules

### Hard Constraints

- 모든 `Response`에 `CORS_HEADERS`를 붙인다. 성공, 400, 429, 503, 500, 404 모두 해당한다 (`index.ts:51-55,155,172,179,190,197,204,210,217`). 새 응답 경로에서 누락하면 브라우저에서 실패한다.
- 새 엔드포인트는 `fetch` 핸들러의 `/api/` 경로 아래에 추가한다. Vite 프록시가 `/api`만 전달한다 (`vite.config.ts`).

### Asymmetry

- 모델 폴백(`withModelFallback`)과 `MAX_TOKENS` 잘림 감지는 Google 경로에만 있다 (`index.ts:134-136`, `123-125`). Anthropic 경로는 단일 모델(`claude-haiku-4-5-20251001`, `max_tokens: 4096`)이며 폴백이 없다 (`index.ts:68-96`). 프로바이더 로직을 수정할 때 두 경로 차이를 의도적으로 판단한다.
- `Provider` 타입이 `index.ts:57`과 `src/types/index.ts:1`에 각각 정의되어 있다. 프로바이더를 추가하면 양쪽과 `ENV_KEYS`(`index.ts:59`)를 함께 수정한다.
- 에러 분류는 `err.message`에 `503`/`429` 문자열이 포함되는지로 판단한다 (`index.ts:194,201`). 프로바이더 에러는 `... API error: ${status}` 형식을 유지한다 (`index.ts:85,112`).

### Double Defense

- `render()` 호출은 `SYSTEM_PROMPT` (`index.ts:12`)와 `ensureRenderCall` (`generator.ts:10-18`) 양쪽에서 보장한다. 한쪽만 제거하지 않는다.
- API 키 누락은 서버(`index.ts:169-174`)와 클라이언트(`src/App.tsx:52`) 양쪽에서 검사한다.

### Security Boundary

- `ENV_KEYS`는 응답에 값으로 내보내지 않는다. `/api/config`는 `!!` boolean만 반환한다 (`index.ts:150-153`).
- Gemini 키는 URL 쿼리에 들어간다 (`index.ts:99`). 요청 URL을 로그나 에러 메시지에 포함하지 않는다.
