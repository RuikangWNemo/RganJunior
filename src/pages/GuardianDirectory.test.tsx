import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import GuardianDirectory from './GuardianDirectory';

function renderDirectory(path = '/about/guardians', language: 'zh' | 'en' = 'zh') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider initialLanguage={language}>
        <Routes>
          <Route path="/about/guardians" element={<GuardianDirectory />} />
          <Route path="/about/guardians/:memberId" element={<GuardianDirectory />} />
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('Guardian directory navigation', () => {
  it('shows fifteen unique entries, includes He Chaochao, and opens a profile then returns to the directory', () => {
    renderDirectory();
    const list = screen.getByLabelText('全部守护团成员');
    expect(within(list).getAllByRole('link')).toHaveLength(15);
    expect(within(list).getAllByRole('img').map((img) => img.getAttribute('src'))).toContain('/images/about/adult-support/adult-support-02.webp');
    expect(screen.getByText('贺超超')).toBeInTheDocument();
    expect(within(list).getAllByRole('img', { name: '卓霏' })).toHaveLength(1);
    expect(within(list).getByRole('link', { name: '查看守护团成员 14 资料' })).toHaveAttribute('href', '/about/guardians/zhuo-fei');
    expect(within(list).getAllByRole('img').map((img) => img.getAttribute('src'))).not.toContain('/images/about/parent-guardian/parent-guardian-08.webp');
    fireEvent.click(within(list).getByRole('link', { name: '查看守护团成员 1 资料' }));
    expect(screen.getByRole('heading', { level: 1, name: '赵璟' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '赵璟' })).toHaveAttribute('src', '/images/about/adult-support/zhao-jing.jpg');
    expect(screen.getByText('敬请期待')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /查看全部成员/ }));
    expect(screen.getByLabelText('全部守护团成员')).toBeInTheDocument();
  });

  it('supports direct links for unnamed members in English without inventing biographies', () => {
    renderDirectory('/about/guardians/guardian-09', 'en');
    expect(screen.getByRole('heading', { level: 1, name: 'Guardian Circle Member' })).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/about/parent-guardian/parent-guardian-09.webp');
    expect(screen.getByRole('link', { name: /View all members/ })).toHaveAttribute('href', '/about/guardians');
  });

  it.each([
    ['he-chaochao', '贺超超', '/images/about/adult-support/adult-support-02.webp'],
    ['zhuo-fei', '卓霏', '/images/about/guardians/zhuo-fei-20261014-upright.png'],
    ['guardian-08', '卓霏', '/images/about/guardians/zhuo-fei-20261014-upright.png'],
  ])('opens the confirmed profile at %s', (id, name, photo) => {
    renderDirectory(`/about/guardians/${id}`);
    expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument();
    expect(screen.getByRole('img', { name })).toHaveAttribute('src', photo);
    expect(screen.getByText('敬请期待')).toBeInTheDocument();
  });

  it('handles missing member URLs with a way back to the directory', () => {
    renderDirectory('/about/guardians/unknown-member');
    expect(screen.getByRole('heading', { name: '未找到这位成员' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /查看全部成员/ })).toHaveAttribute('href', '/about/guardians');
  });
});
