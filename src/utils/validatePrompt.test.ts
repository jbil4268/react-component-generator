import { describe, it, expect } from 'vitest';
import { validatePrompt, MAX_PROMPT_LENGTH } from './validatePrompt';

describe('validatePrompt', () => {
  it('500자 이하이면 유효하다', () => {
    expect(validatePrompt('프로필 카드')).toEqual({ valid: true, length: 6 });
  });

  it('정확히 500자는 유효하다', () => {
    const result = validatePrompt('a'.repeat(MAX_PROMPT_LENGTH));
    expect(result.valid).toBe(true);
    expect(result.length).toBe(500);
  });

  it('501자는 에러 메시지와 함께 무효이다', () => {
    const result = validatePrompt('a'.repeat(MAX_PROMPT_LENGTH + 1));
    expect(result.valid).toBe(false);
    expect(result.length).toBe(501);
    expect(result.error).toBe('프롬프트는 500자 이하로 입력해주세요.');
  });

  it('앞뒤 공백은 길이에 포함하지 않는다', () => {
    const result = validatePrompt(`  ${'a'.repeat(MAX_PROMPT_LENGTH)}  `);
    expect(result.valid).toBe(true);
    expect(result.length).toBe(500);
  });
});
