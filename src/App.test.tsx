import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// 미리보기(react-live)는 이 테스트의 관심사가 아니므로 비운다.
vi.mock('./components/ComponentCard', () => ({ ComponentCard: () => null }));

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url === '/api/config') {
        return { ok: true, json: async () => ({ envKeys: { anthropic: false, google: false } }) };
      }
      return { ok: true, json: async () => ({ code: 'render(<div />)' }) };
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App 상태 영속화', () => {
  it('저장된 Provider로 시작한다', () => {
    localStorage.setItem('provider', JSON.stringify('anthropic'));
    render(<App />);
    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
  });

  it('Provider를 바꾸면 localStorage에 저장된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');

    expect(JSON.parse(localStorage.getItem('provider') ?? 'null')).toBe('anthropic');
  });

  it('잘못된 Provider 값이 저장돼 있으면 기본값으로 시작한다', () => {
    localStorage.setItem('provider', JSON.stringify('openai'));
    render(<App />);
    expect(screen.getByLabelText('Provider')).toHaveValue('google');
  });

  it('입력한 API 키가 새로고침 후에도 복원된다', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.type(screen.getByLabelText('API Key'), 'AIza-test');
    first.unmount();

    render(<App />);

    expect(screen.getByLabelText('API Key')).toHaveValue('AIza-test');
  });

  it('API 키는 Provider별로 따로 보관된다', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('API Key'), 'google-key');

    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');
    expect(screen.getByLabelText('API Key')).toHaveValue('');

    await user.selectOptions(screen.getByLabelText('Provider'), 'google');
    expect(screen.getByLabelText('API Key')).toHaveValue('google-key');
  });

  it('생성한 프롬프트가 히스토리에 저장되고 새로고침 후 다시 보인다', async () => {
    const user = userEvent.setup();
    localStorage.setItem('apiKeys', JSON.stringify({ anthropic: '', google: 'k' }));
    const first = render(<App />);

    await user.type(screen.getByRole('textbox'), '로그인 폼');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('promptHistory') ?? '[]')).toEqual(['로그인 폼']);
    });
    first.unmount();

    render(<App />);

    expect(screen.getByRole('button', { name: '로그인 폼' })).toBeInTheDocument();
  });
});
