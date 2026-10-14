import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { FieldNote } from '@/types/field-notes';
import { FeaturedReader } from './FeaturedReader';

const notes: FieldNote[] = ['forest', 'kitchen', 'tea'].map((slug, i) => ({
  slug, title: { zh: `文章${i + 1}`, en: `Story ${i + 1}` }, excerpt: { zh: '真实生活中的一段观察。', en: 'An observation from everyday life.' },
  authorSlugs: [], topicSlugs: [], publishedAt: '2026-10-14', readingMinutes: 3,
  cover: `/${slug}.jpg`, coverAlt: { zh: '实景照片', en: 'Field photograph' }, authors: [], topics: [],
}));

describe('FeaturedReader', () => {
  beforeEach(() => window.localStorage.setItem('rgan-lang', 'en'));
  const show = () => render(<MemoryRouter><LanguageProvider><FeaturedReader notes={notes} /></LanguageProvider></MemoryRouter>);

  it('shows one story at a time and moves to the correct article with next and previous', () => {
    show();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(within(screen.getByRole('tabpanel')).getByRole('heading', { name: 'Story 1' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next featured article' }));
    expect(within(screen.getByRole('tabpanel')).getByRole('link', { name: 'Read this story' })).toHaveAttribute('href', '/field-notes/kitchen');
    fireEvent.click(screen.getByRole('button', { name: 'Previous featured article' }));
    expect(within(screen.getByRole('tabpanel')).getByRole('heading', { name: 'Story 1' })).toBeInTheDocument();
  });

  it('lets the reader select any story from the complete directory', () => {
    show();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    fireEvent.mouseDown(screen.getByRole('tab', { name: /Story 3/ }), { button: 0, ctrlKey: false });
    expect(within(screen.getByRole('tabpanel')).getByRole('heading', { name: 'Story 3' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Story 3/ })).toHaveAttribute('aria-selected', 'true');
  });
});
