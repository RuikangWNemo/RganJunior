import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ActionInquiry from './ActionInquiry';

function renderActionInquiry(initialEntry = '/programs/inquiry') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LanguageProvider>
        <ActionInquiry />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

function completeRequiredFields() {
  fireEvent.change(screen.getByLabelText('姓名'), { target: { value: '本地验证用户' } });
  fireEvent.change(screen.getByLabelText('年龄、年级或参与身份'), { target: { value: '15 岁，高一' } });
  fireEvent.change(screen.getByLabelText('所在城市'), { target: { value: '成都' } });
  fireEvent.change(screen.getByLabelText('预计参与时间'), { target: { value: '寒假' } });
  fireEvent.change(screen.getByLabelText('预计参与人数'), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText('联系方式'), { target: { value: 'probe@example.com' } });
  fireEvent.change(screen.getByLabelText('最想了解的问题'), { target: { value: '想了解安全与费用说明。' } });
  fireEvent.click(screen.getByLabelText('同意阿柑少年为项目咨询与后续联系保存这些信息。'));
}

describe('ActionInquiry', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preselects a valid program and keeps the flow separate from joining the community', () => {
    renderActionInquiry('/programs/inquiry?program=action-group');

    expect(screen.getByRole('heading', { name: '留下参与意向' })).toBeInTheDocument();
    expect(screen.getByLabelText('感兴趣的项目')).toHaveTextContent('阿柑少年行动小组');
    expect(screen.getByRole('link', { name: '返回项目介绍' })).toHaveAttribute('href', '/programs/action-group');
    expect(screen.getByLabelText('预计参与时间')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '提交参与意向' })).toBeInTheDocument();
    expect(screen.queryByText('填写加入表单')).not.toBeInTheDocument();
  });

  it('falls back to the life experience camp when the program parameter is invalid', () => {
    renderActionInquiry('/programs/inquiry?program=unknown');

    expect(screen.getByLabelText('感兴趣的项目')).toHaveTextContent('生活体验营');
    expect(screen.getByRole('link', { name: '返回项目介绍' })).toHaveAttribute('href', '/programs/life-experience-camp');
  });

  it('submits to the independent action enquiry endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderActionInquiry('/programs/inquiry?program=public-projects');
    completeRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '提交参与意向' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        '参与意向已收到。我们会通过你留下的联系方式继续沟通。',
      );
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/action-inquiry', expect.objectContaining({ method: 'POST' }));
    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(requestBody).toMatchObject({
      program: 'public-projects',
      name: '本地验证用户',
      participantProfile: '15 岁，高一',
      city: '成都',
      preferredTime: '寒假',
      partySize: '2',
      contact: 'probe@example.com',
      consent: true,
      language: 'zh',
    });
    expect(screen.getByLabelText('姓名')).toHaveValue('');
  });

  it('keeps the form content and offers email when submission fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, code: 'MISSING_GOOGLE_FORM_CONFIG' }),
    }));

    renderActionInquiry();
    completeRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '提交参与意向' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('你填写的内容仍在页面中');
    });
    expect(screen.getByLabelText('姓名')).toHaveValue('本地验证用户');
    expect(screen.getAllByRole('link', { name: 'contact@rganjunior.org' }).length).toBeGreaterThan(0);
  });
});
