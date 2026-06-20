import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import JoinUs from './JoinUs';

function renderJoinUs() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <JoinUs />
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe('JoinUs', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('renders the identity selector and apply entry', () => {
    renderJoinUs();

    expect(screen.getByRole('heading', { name: '加入阿柑少年' })).toBeInTheDocument();
    const voicesHeading = screen.getByRole('heading', { name: '伙伴之声' });
    const youthTab = screen.getByRole('tab', { name: /成为阿柑少年/ });
    const voicesLink = screen.getByRole('link', { name: '打开展开页' });
    const applyLinks = screen.getAllByRole('link', { name: '填写表单，进入小规模深度探索。' });

    expect(youthTab).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /成为阿柑家长/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /成为合作伙伴/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '选择你的加入身份' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '成为阿柑少年的悬挂卡片插图' })).toBeInTheDocument();
    expect(voicesHeading).toBeInTheDocument();
    expect(voicesHeading.compareDocumentPosition(youthTab) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(voicesLink).toHaveAttribute('href', '/voices');
    expect(screen.getByText('这里先保留为一个安静入口。访谈文字、真实音频、播客片段或短片整理完成后，会放在独立页面中逐步更新。')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '表单与联系方式' })).not.toBeInTheDocument();
    expect(applyLinks).toHaveLength(1);
    expect(applyLinks[0]).toHaveAttribute('href', '/join/apply?audience=join-youth');
    expect(screen.queryByLabelText('姓名')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '提交申请' })).not.toBeInTheDocument();
    expect(screen.queryByText('已开放')).not.toBeInTheDocument();
  });

  it('switches the narrative panel when selecting another identity', () => {
    renderJoinUs();

    fireEvent.click(screen.getByRole('tab', { name: /成为阿柑家长/ }));

    expect(screen.getAllByRole('heading', { name: '成为阿柑家长' }).length).toBeGreaterThan(0);
    expect(screen.getByText('真实社区、小规模同行和清晰边界。')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '成为阿柑家长的悬挂卡片插图' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '填写表单，预约进一步沟通。' })[0]).toHaveAttribute(
      'href',
      '/join/apply?audience=join-parents'
    );
    expect(screen.queryByText('当前阶段')).not.toBeInTheDocument();
    expect(screen.queryByText('已开放')).not.toBeInTheDocument();
  });
});
