import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ProgramDetail from './ProgramDetail';

function renderProgramDetail(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider>
        <Routes>
          <Route path="/programs/:programId" element={<ProgramDetail />} />
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('ProgramDetail', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it.each([
    ['/programs/life-experience-camp', '阿柑少年生活体验营', '用两天，重新感觉生活', 'life-experience-camp'],
    ['/programs/life-co-creation-camp', '阿柑少年生活共创营', '五天里，我们一起承担', 'life-co-creation-camp'],
    ['/programs/action-group', '阿柑少年行动小组', '三个月，把相遇带回日常', 'action-group'],
    ['/programs/public-projects', '青少年研究计划', '从真实问题开始研究', 'public-projects'],
  ])('renders the dedicated content at %s', (path, title, sectionTitle, programId) => {
    const { container } = renderProgramDetail(path);

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: sectionTitle })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '常见问题' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '留下参与意向' })).toHaveAttribute(
      'href',
      `/programs/inquiry?program=${programId}`,
    );
    expect(screen.getByRole('link', { name: '返回项目总览' })).toHaveAttribute(
      'href',
      `/programs#${programId}`,
    );
    expect(container.querySelector(`[data-schema-id="program-faq-${programId}"]`)).toBeInTheDocument();
  });

  it('keeps FAQ answers collapsed until the question is opened', () => {
    renderProgramDetail('/programs/life-experience-camp');

    const question = screen.getByRole('button', { name: '生活体验营适合谁？' });
    expect(question).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(question);
    expect(question).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/第一次接触阿柑少年的 12-18 岁青少年和家庭/)).toBeVisible();
  });

  it('redirects the legacy life-camp route to the co-creation camp', () => {
    renderProgramDetail('/programs/life-camp');

    expect(screen.getByRole('heading', { level: 1, name: '阿柑少年生活共创营' })).toBeInTheDocument();
  });

  it('renders the not-found page for an unknown program', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderProgramDetail('/programs/unknown');

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    errorSpy.mockRestore();
  });
});
