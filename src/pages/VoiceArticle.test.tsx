import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { voiceStories } from '@/content/voiceStories';
import VoiceArticle from './VoiceArticle';

function renderVoiceArticle(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider>
        <Routes>
          <Route path="/voices/:slug" element={<VoiceArticle />} />
        </Routes>
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe('VoiceArticle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('rgan-lang', 'zh');
  });

  it('renders the local article body and the original source link', () => {
    const { container } = renderVoiceArticle('/voices/technology-ecology-stars');

    expect(screen.getByRole('heading', { name: '在科技与生态之间寻找星辰大海' })).toBeInTheDocument();
    expect(screen.getByText('大家好，我是张天时，今年18岁，居住在河南省郑州市，是一名高中毕业生。')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '阅读微信原文' })).toHaveAttribute(
      'href',
      'https://mp.weixin.qq.com/s/wBHWZw3OASCSjO-9GMrmjg'
    );
    expect(screen.getByRole('link', { name: '返回伙伴之声' })).toHaveAttribute('href', '/voices');
    expect(container.querySelector('.voice-article-page--growth-story')).toBeInTheDocument();
    expect(container.querySelector('.article-media-frame')).toBeInTheDocument();
    expect(container.querySelector('.article-media-frame--portrait')).toBeInTheDocument();
  });

  it('keeps the project letter outside the personal story editorial variant', () => {
    const { container } = renderVoiceArticle('/voices/summer-co-creation-camp-invitation');

    expect(container.querySelector('.voice-article-page--growth-story')).not.toBeInTheDocument();
    expect(container.querySelector('.article-media-frame')).not.toBeInTheDocument();
  });

  it('provides reusable media groups for every growth story', () => {
    voiceStories
      .filter((story) => story.kind === 'growth-story')
      .forEach((story) => {
        expect(story.bodyHtml).toContain('article-media-frame');
        expect(story.bodyHtml).not.toContain('更多照片如下');
      });
  });

  it('omits retired summer camp and registration sections from every article', () => {
    const retiredContent = [
      '这个暑假，我们想继续往前走',
      '这个暑假，我和朋友们决定试一试',
      '这个暑假，从一个人到一群人',
      '这个暑假，一场属于青少年的实践',
      '扫码报名',
      '活动咨询',
      '课程费用',
      '4500元',
      '4200元',
      '399元',
      '赵老师',
    ];

    voiceStories.forEach((story) => {
      retiredContent.forEach((content) => {
        expect(story.bodyHtml).not.toContain(content);
      });
    });
  });
});
