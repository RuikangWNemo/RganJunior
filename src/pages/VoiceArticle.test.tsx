import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { voiceStories } from '@/content/voiceStories';
import VoiceArticle from './VoiceArticle';
function Target() { const { slug } = useParams(); return <h1>{slug}</h1>; }
describe('legacy story links', () => {
  it.each(voiceStories.map((story) => story.slug))('keeps %s linked to the unified article', (slug) => {
    render(<MemoryRouter initialEntries={[`/voices/${slug}`]}><LanguageProvider><Routes>
      <Route path="/voices/:slug" element={<VoiceArticle />} />
      <Route path="/community-stories/:slug" element={<Target />} />
    </Routes></LanguageProvider></MemoryRouter>);
    expect(screen.getByRole('heading', { name: slug })).toBeInTheDocument();
  });
  it('preserves all source images and bilingual founder stories', () => {
    voiceStories.filter((story) => story.kind === 'growth-story').forEach((story) => {
      expect(story.bodyHtml.en).toBeTruthy();
      expect(story.bodyHtml.en.match(/<img\b/g)).toHaveLength(story.bodyHtml.zh.match(/<img\b/g)?.length || 0);
    });
  });
});
