import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
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

  it('renders the dedicated application form', () => {
    renderJoinApply('/join/apply?audience=join-partners');

    expect(screen.getByRole('heading', { name: '填写加入表单' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回加入方式' })).toHaveAttribute('href', '/join');
    expect(screen.getAllByText('成为合作伙伴').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('姓名')).toBeInTheDocument();
    expect(screen.getByLabelText('联系方式')).toBeInTheDocument();
    expect(screen.getByLabelText('想加入或合作的原因')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '提交申请' })).toBeInTheDocument();
  });
});
