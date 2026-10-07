import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

const STORAGE_KEY = 'components';

const saved = [
  { id: '1', prompt: '카드', code: 'render(<div />)', createdAt: '2026-01-02T03:04:05.000Z' },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useComponentGenerator 영속화', () => {
  it('저장된 컴포넌트 목록을 복원하고 createdAt을 Date로 되살린다', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].prompt).toBe('카드');
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
    expect(result.current.components[0].createdAt.toISOString()).toBe('2026-01-02T03:04:05.000Z');
  });

  it('형식이 맞지 않는 저장값은 무시하고 빈 목록으로 시작한다', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.components).toEqual([]);
  });

  it('생성에 성공하면 새 컴포넌트가 localStorage에 저장된다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'render(<b />)' }) }),
    );
    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('굵은 글씨', undefined, 'google');
    });

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].prompt).toBe('굵은 글씨');
    });
  });

  it('전체 삭제하면 저장된 목록도 비워진다', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    const { result } = renderHook(() => useComponentGenerator());

    act(() => result.current.clearAll());

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual([]);
  });
});
