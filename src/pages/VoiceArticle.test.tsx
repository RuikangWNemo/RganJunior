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
        expect(story.bodyHtml.zh).toContain('article-media-frame');
        expect(story.bodyHtml.en).toContain('article-media-frame');
        expect(story.bodyHtml.zh).not.toContain('更多照片如下');
        expect(story.bodyHtml.en.match(/<img\b/g)).toHaveLength(
          story.bodyHtml.zh.match(/<img\b/g)?.length ?? 0
        );
      });
  });

  it('renders a complete English body for every growth story', () => {
    const expectedCopy: Record<string, string> = {
      'it-takes-a-village': 'My name is Nate.',
      'tea-connects-an-american-girl': "Hi everyone, I'm Ruorong!",
      'tea-kitchen-and-summer': "Hi everyone! I'm Ruoyin, though you can also call me Ruby.",
      'technology-ecology-stars': "Hello, I'm Tianshi Zhang.",
    };

    window.localStorage.setItem('rgan-lang', 'en');

    voiceStories
      .filter((story) => story.kind === 'growth-story')
      .forEach((story) => {
        const { container, unmount } = renderVoiceArticle(`/voices/${story.slug}`);
        const body = container.querySelector('.voice-article-body');

        expect(body).toHaveAttribute('lang', 'en');
        expect(body).toHaveTextContent(expectedCopy[story.slug]);
        expect(screen.queryByText('This story is presented in its original Chinese text.')).not.toBeInTheDocument();
        unmount();
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
      Object.values(story.bodyHtml).forEach((bodyHtml) => {
        retiredContent.forEach((content) => {
          expect(bodyHtml).not.toContain(content);
        });
      });
    });
  });
});
