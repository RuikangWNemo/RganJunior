import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import JoinApply from './JoinApply';

function renderJoinApply(initialEntry = '/join/apply') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LanguageProvider>
        <JoinApply />
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe('JoinApply', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the dedicated application form', () => {
    renderJoinApply('/join/apply?audience=join-partners');

    expect(screen.getByRole('heading', { name: '填写加入表单' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回加入方式' })).toHaveAttribute('href', '/join');
    expect(screen.getAllByText('成为合作伙伴').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('姓名')).toBeInTheDocument();
    expect(screen.getByLabelText('联系方式')).toBeInTheDocument();
    expect(screen.getByLabelText('想加入或合作的原因')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '提交申请' })).toBeInTheDocument();
    expect(screen.getByText('一颗种子不需要立刻知道，自己会长成什么样。')).toBeInTheDocument();
  });

  it('submits the selected audience and renders the warm success response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderJoinApply('/join/apply?audience=join-parents');

    fireEvent.change(screen.getByLabelText('姓名'), { target: { value: '本地验证用户' } });
    fireEvent.change(screen.getByLabelText('联系方式'), { target: { value: 'probe@example.com' } });
    fireEvent.change(screen.getByLabelText('想加入或合作的原因'), {
      target: { value: '希望和大家一起走进真实世界。' },
    });
    fireEvent.click(screen.getByLabelText('同意阿柑少年为后续联系保存这些信息。'));
    fireEvent.click(screen.getByRole('button', { name: '提交申请' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        '申请已收到。我们会通过你留下的联系方式继续沟通。'
      );
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/join',
      expect.objectContaining({ method: 'POST' })
    );
    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(requestBody).toMatchObject({
      audience: 'join-parents',
      name: '本地验证用户',
      contact: 'probe@example.com',
      consent: true,
      language: 'zh',
    });
    expect(screen.getByLabelText('姓名')).toHaveValue('');
  });
});
