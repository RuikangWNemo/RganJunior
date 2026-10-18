import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { getStaticImageProps } from '@/lib/staticImages';
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
  it('shows nineteen unique entries, includes He Chaochao, and opens a profile then returns to the directory', () => {
    renderDirectory();
    const list = screen.getByLabelText('全部守护团成员');
    expect(within(list).getAllByRole('link')).toHaveLength(20);
    expect(within(list).getAllByRole('img').map((img) => img.getAttribute('src'))).toContain('/images/about/adult-support/adult-support-02.webp');
    expect(screen.getByText('贺超超')).toBeInTheDocument();
    expect(within(list).getAllByRole('img', { name: '卓霏' })).toHaveLength(1);
    expect(within(list).getByRole('link', { name: '查看守护团成员 15 资料' })).toHaveAttribute('href', '/about/guardians/zhuo-fei');
    expect(within(list).getAllByRole('img').map((img) => img.getAttribute('src'))).not.toContain('/images/about/parent-guardian/parent-guardian-08.webp');
    fireEvent.click(within(list).getByRole('link', { name: '查看守护团成员 1 资料' }));
    expect(screen.getByRole('heading', { level: 1, name: '赵璟' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '赵璟' })).toHaveAttribute('src', getStaticImageProps('/images/about/adult-support/zhao-jing.jpg').src);
    expect(screen.getByRole('img', { name: '赵璟' })).toHaveAttribute('srcset');
    expect(screen.getByText('敬请期待')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /查看全部成员/ }));
    expect(screen.getByLabelText('全部守护团成员')).toBeInTheDocument();
  });

  it('supports direct links for unnamed members in English without inventing biographies', () => {
    renderDirectory('/about/guardians/guardian-09', 'en');
    expect(screen.getByRole('heading', { level: 1, name: 'Guardian Circle Member' })).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', getStaticImageProps('/images/about/parent-guardian/parent-guardian-09.webp').src);
    expect(screen.getByRole('link', { name: /View all members/ })).toHaveAttribute('href', '/about/guardians');
  });

  it.each([
    ['he-chaochao', '贺超超', '/images/about/adult-support/adult-support-02.webp'],
    ['zhuo-fei', '卓霏', '/images/about/guardians/zhuo-fei-20261014-upright.png'],
    ['guardian-08', '卓霏', '/images/about/guardians/zhuo-fei-20261014-upright.png'],
  ])('opens the confirmed profile at %s', (id, name, photo) => {
    renderDirectory(`/about/guardians/${id}`);
    expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument();
    expect(screen.getByRole('img', { name })).toHaveAttribute('src', getStaticImageProps(photo).src);
    expect(screen.getByText('敬请期待')).toBeInTheDocument();
  });

  it('reuses the confirmed participant biography for the same guardian', () => {
    renderDirectory('/about/guardians/wang-ruikang');
    expect(screen.getByRole('heading', { name: '王睿康' })).toBeInTheDocument();
    expect(screen.getByText('喜欢与人和自然打交道，喜欢摄影、音乐和旅行。')).toBeInTheDocument();
    expect(screen.queryByText('敬请期待')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /查看个人介绍/ })).toHaveAttribute('href', '/about/participants/ruikang');
  });

  it('handles missing member URLs with a way back to the directory', () => {
    renderDirectory('/about/guardians/unknown-member');
    expect(screen.getByRole('heading', { name: '未找到这位成员' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /查看全部成员/ })).toHaveAttribute('href', '/about/guardians');
  });
});
