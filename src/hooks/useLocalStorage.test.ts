import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  it('저장된 값이 없으면 초기값을 반환한다', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('저장된 값이 있으면 그 값으로 시작한다', () => {
    localStorage.setItem('k', JSON.stringify('saved'));
    const { result } = renderHook(() => useLocalStorage('k', 'init'));
    expect(result.current[0]).toBe('saved');
  });

  it('값을 바꾸면 localStorage에 JSON으로 저장한다', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'init'));
    act(() => result.current[1]('next'));
    expect(localStorage.getItem('k')).toBe(JSON.stringify('next'));
  });

  it('저장된 값이 깨진 JSON이면 초기값을 반환한다', () => {
    localStorage.setItem('k', '{not json');
    const { result } = renderHook(() => useLocalStorage('k', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('revive가 있으면 저장된 값을 변환해 반환한다', () => {
    localStorage.setItem('k', JSON.stringify(2));
    const { result } = renderHook(() => useLocalStorage('k', 0, (raw) => Number(raw) * 10));
    expect(result.current[0]).toBe(20);
  });

  it('revive가 에러를 던지면 초기값을 반환한다', () => {
    localStorage.setItem('k', JSON.stringify(1));
    const { result } = renderHook(() =>
      useLocalStorage('k', 'init', () => {
        throw new Error('invalid');
      }),
    );
    expect(result.current[0]).toBe('init');
  });
});
