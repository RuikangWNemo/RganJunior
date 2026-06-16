import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import JoinUs from './JoinUs';

describe('JoinUs', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('renders the identity selector and shared contact ledger', () => {
    render(
      <LanguageProvider>
        <JoinUs />
      </LanguageProvider>
    );

    expect(screen.getByRole('heading', { name: '加入阿柑少年' })).toBeInTheDocument();
    const voicesHeading = screen.getByRole('heading', { name: '伙伴之声' });
    const youthTab = screen.getByRole('tab', { name: '成为阿柑少年' });

    expect(youthTab).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '成为阿柑家长' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '成为合作伙伴' })).toBeInTheDocument();
    expect(voicesHeading).toBeInTheDocument();
    expect(voicesHeading.compareDocumentPosition(youthTab) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('山野之后，我重新听见了自己')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '统一联系方式' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('switches the narrative panel when selecting another identity', () => {
    render(
      <LanguageProvider>
        <JoinUs />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByRole('tab', { name: '成为阿柑家长' }));

    expect(screen.getByRole('heading', { name: '成为阿柑家长' })).toBeInTheDocument();
    expect(screen.getByText('安全、有爱的成长环境。')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '我们正处于小规模深度探索阶段' })).toBeInTheDocument();
    expect(screen.getByText('名额有限。如果你认同我们的理念，请通过官方渠道联系我们。')).toBeInTheDocument();
  });
});
