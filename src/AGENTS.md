# src/AGENTS.md

## Module Context

Vite + React 19 프런트엔드. `App.tsx`가 프로바이더/키/테마 상태를 관리하고, `hooks/useComponentGenerator.ts`가 `/api/generate`를 호출하며, `components/`가 입력, 미리보기, 코드 표시를 담당한다.

## Tech Stack & Constraints

- 스타일은 전역 CSS(`App.css`, `index.css`)와 클래스명으로 관리한다. CSS Modules, CSS-in-JS, Tailwind를 도입하지 않는다.
- 테마는 `document.documentElement.dataset.theme`로 적용한다 (`App.tsx:38`). 새 색상은 기존 CSS 변수 방식에 맞춘다.
- 서버 호출은 `fetch('/api/...')` 상대 경로만 사용한다 (`hooks/useComponentGenerator.ts:23`, `App.tsx:43`). 별도 HTTP 클라이언트 라이브러리를 추가하지 않는다.

## Implementation Patterns

- 서버 상태 호출과 에러 처리는 훅에 둔다. 컴포넌트는 `components/`에 `PascalCase.tsx`, 훅은 `hooks/useXxx.ts`, 공용 타입은 `types/index.ts`에 둔다.
- `react-refresh/only-export-components` 규칙 때문에 컴포넌트 파일에서는 컴포넌트만 export한다 (`eslint.config.js`의 `reactRefresh.configs.vite`).
- 미리보기 새로고침은 `key` 증가로 리마운트하는 방식이다 (`components/ComponentCard.tsx`의 `previewKey`). 상태 초기화용으로 별도 로직을 만들지 않는다.
- 새 결과는 목록 맨 앞에 추가한다 (`hooks/useComponentGenerator.ts:42`).

## Testing Strategy

- 단일 실행: `bunx vitest run src`. 컴포넌트 테스트는 `@testing-library/react` + `user-event`를 쓰고 `getByRole`로 조회한다 (`components/PromptInput.test.tsx`).
- 테스트가 버튼 이름 `컴포넌트 생성`, `생성 중...`으로 조회한다. 해당 UI 문구를 바꾸면 테스트를 함께 수정한다.
- 공용 설정은 `test/setup.ts` (jest-dom matcher, 각 테스트 후 `cleanup()`). 테스트마다 반복하지 않는다.

## Local Golden Rules

### Hard Constraints

- `tsconfig.app.json`의 `verbatimModuleSyntax`(13행)와 `erasableSyntaxOnly`(22행) 때문에 타입 import는 `import type`을 쓰고, `enum`, `namespace`, 생성자 파라미터 프로퍼티를 쓰지 않는다 (`hooks/useComponentGenerator.ts:2`가 `import type` 사용).
- `noUnusedLocals`, `noUnusedParameters`가 켜져 있어 미사용 변수는 빌드(`tsc -b`)를 깨뜨린다.

### Security Boundary

- `LivePreview`는 AI가 생성한 코드를 `react-live`로 같은 페이지에서 실행한다. `LiveProvider`에 `scope`를 넘기지 않아 `React` 외에는 접근하지 못한다 (`components/LivePreview.tsx:74`). `scope`에 `apiKey`, 서버 응답, 앱 상태를 넣지 않는다.
- 생성 코드를 `dangerouslySetInnerHTML`이나 `innerHTML`로 렌더하지 않는다. 현재 `src/`에는 사용처가 없다.
- `apiKey`는 `App.tsx`의 React state에만 둔다 (`App.tsx:24`). `localStorage`에는 `theme`만 저장한다 (`App.tsx:32,39`). 프로바이더 변경 시 키를 비운다 (`App.tsx:61`).

### Asymmetry

- `Provider` 타입은 `types/index.ts:1`과 `server/index.ts:57`에 각각 정의되어 있다. 프로바이더를 추가하면 양쪽을 함께 수정한다.
- 훅은 `res.json()`을 `res.ok` 확인 전에 호출한다 (`hooks/useComponentGenerator.ts:29-33`). 서버는 에러도 JSON `{ error }`로 응답하는 계약이므로 이를 유지한다.

### Double Defense

- API 키 누락 검사는 `App.tsx:52`와 `server/index.ts:169-174` 양쪽에 있다. 한쪽만 제거하지 않는다.

### Test Boundary

- 테스트 있음: `components/PromptInput.tsx`만 있다. 테스트 없음: `App.tsx`, `hooks/useComponentGenerator.ts`, `LivePreview`, `CodeView`, `ComponentCard`. 훅이나 App 로직을 바꿀 때는 해당 동작을 검증하는 테스트를 추가한다.
