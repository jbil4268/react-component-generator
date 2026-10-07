---
name: create-pr
description: 현재 브랜치의 커밋과 diff를 분석해 PR 제목·본문을 작성하고 `gh pr create`로 Pull Request를 생성한다. "PR 만들어줘", "PR 생성", "풀리퀘스트 올려줘", "create a PR", "open a pull request" 같은 요청에 활성화한다. 커밋 작성에는 쓰지 않는다(commit 스킬 사용).
context: fork
allowed-tools: Read Glob Grep Bash
---

# Create PR

현재 브랜치의 변경 내용을 분석해 Pull Request를 생성한다.
이 스킬은 `context: fork`로 실행되어 사용자에게 되묻지 못한다. 그래서 모호하면 멈추고 이유를 보고하며, 판단이 가능하면 기본값으로 진행한다.

## 인자

`$ARGUMENTS`로 옵션을 받는다.

- `en` / `english`: 영어 템플릿 사용. 지정이 없으면 한국어 템플릿을 쓴다 (이 프로젝트는 PR·커밋 문구를 한국어로 쓴다).
- `draft`: Draft PR로 생성한다.
- `base=<브랜치>`: base 브랜치 지정. 기본값은 `main`.

## 절차

### 1. 사전 점검

아래를 병렬로 실행한다.

- `git branch --show-current` — 현재 브랜치
- `git status --short` — 커밋되지 않은 변경
- `gh auth status` — GitHub 인증
- `git remote -v` — 원격 확인

멈춰야 하는 경우 (사실만 보고하고 PR은 만들지 않는다):

- 현재 브랜치가 base 브랜치와 같다 (`main`에서 바로 PR을 만들 수 없다).
- 인증이 안 되어 있거나 원격이 없다.
- `git status`에 커밋되지 않은 변경이 있다 → 커밋 후 다시 실행하도록 안내한다 (`commit` 스킬 사용). 변경을 임의로 커밋하지 않는다. 의도하지 않은 내용이 PR에 섞이는 것을 막기 위해서다.

### 2. 변경 분석

base 대비 이 브랜치에서 추가된 내용만 본다.

- `git log --oneline <base>..HEAD` — 커밋 목록
- `git diff <base>...HEAD --stat` 후 필요한 파일만 `git diff <base>...HEAD -- <path>`
- 커밋이 0개면 "PR로 올릴 변경이 없다"고 보고하고 멈춘다.
- 같은 브랜치에 이미 열린 PR이 있는지 `gh pr list --head <브랜치> --state open`으로 확인한다. 있으면 URL만 알리고 멈춘다.

`.env` 같은 비밀 파일이 diff에 보이면 PR을 만들지 말고 즉시 보고한다.

### 3. 제목·본문 작성

1. `references/pr-template.md`를 Read로 읽는다. 언어에 맞는 섹션(한국어 / English)만 사용한다.
2. 템플릿의 각 항목을 diff와 커밋 내용에서 확인한 사실로 채운다. 추측으로 채우지 않는다.
3. 제목은 `type: 요약` 형식 (feat/fix/refactor/chore/test/docs), 70자 이내. 영어 템플릿이면 요약도 영어로 쓴다.
4. 테스트 항목은 실제로 실행한 결과만 체크한다. 프로젝트 기준 검증 명령은 `bun run test`, `bun run lint`, `bun run build`이며, 실행하지 않았다면 체크하지 않고 "미실행"이라고 적는다. 통과했다고 거짓 보고를 하면 리뷰어가 잘못된 신뢰를 갖게 된다.
5. 해당하지 않는 선택 항목은 줄을 지운다. 빈 항목을 남기지 않는다.
6. 템플릿 마지막의 `🤖 Generated with [Claude Code](https://claude.com/claude-code)` 줄은 그대로 유지한다.

### 4. 푸시와 생성

1. 원격에 브랜치가 없거나 로컬이 앞서 있으면 `git push -u origin <브랜치>`를 실행한다. force push는 하지 않는다.
2. 본문은 heredoc으로 전달해 줄바꿈과 특수문자가 깨지지 않게 한다.

````bash
gh pr create --base <base> --title "<제목>" --body "$(cat <<'EOF'
<본문>
EOF
)"
````

`draft` 인자가 있으면 `--draft`를 추가한다.

### 5. 결과 보고

생성된 PR URL, 제목, base/head 브랜치, 생략하거나 실행하지 않은 항목을 한국어로 간단히 보고한다.
