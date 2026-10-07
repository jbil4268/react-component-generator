# PR 본문 템플릿

언어에 맞는 섹션 하나만 사용한다. `<...>`는 diff·커밋에서 확인한 내용으로 바꾸고, 해당 없는 선택 항목은 줄째 삭제한다.

---

## 한국어

```markdown
## 요약

<이 PR이 무엇을 왜 바꾸는지 1~3문장>

## 변경 사항

- <주요 변경 1>
- <주요 변경 2>

## 변경 유형

- [ ] feat: 새 기능
- [ ] fix: 버그 수정
- [ ] refactor: 동작 변경 없는 구조 개선
- [ ] test: 테스트 추가·수정
- [ ] docs: 문서
- [ ] chore: 설정·빌드·기타

## 테스트

- [ ] `bun run test`
- [ ] `bun run lint`
- [ ] `bun run build`

<실행하지 않은 항목이 있으면 이유를 적는다>

## 리뷰 포인트

<리뷰어가 특히 봐야 할 부분. 선택>

## 관련 이슈

<Closes #번호. 선택>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## English

```markdown
## Summary

<What this PR changes and why, in 1-3 sentences>

## Changes

- <Key change 1>
- <Key change 2>

## Type of change

- [ ] feat: new feature
- [ ] fix: bug fix
- [ ] refactor: structural change without behavior change
- [ ] test: add or update tests
- [ ] docs: documentation
- [ ] chore: config, build, misc

## Testing

- [ ] `bun run test`
- [ ] `bun run lint`
- [ ] `bun run build`

<If any item was not run, state why>

## Review notes

<Areas reviewers should look at closely. Optional>

## Related issues

<Closes #number. Optional>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```
