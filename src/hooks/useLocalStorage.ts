import { useState, useEffect } from 'react';

function read<T>(key: string, initial: T, revive?: (raw: unknown) => T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return initial;
    const parsed: unknown = JSON.parse(saved);
    return revive ? revive(parsed) : (parsed as T);
  } catch {
    // 깨진 JSON이나 revive 실패는 초기값으로 복구한다.
    return initial;
  }
}

export function useLocalStorage<T>(
  key: string,
  initial: T,
  revive?: (raw: unknown) => T,
) {
  const [value, setValue] = useState<T>(() => read(key, initial, revive));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 용량 초과·저장소 차단 시에도 앱은 메모리 상태로 계속 동작한다.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
