import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { participants, campCompanions } from '@/content/participants';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ParticipantDirectory from './ParticipantDirectory';

const show = (path: string) => render(<MemoryRouter initialEntries={[path]}><LanguageProvider><Routes>
  <Route path="/about/participants" element={<ParticipantDirectory />} />
  <Route path="/about/participants/:participantId" element={<ParticipantDirectory />} />
</Routes></LanguageProvider></MemoryRouter>);

describe('Camp companion directory', () => {
  beforeEach(() => { localStorage.setItem('rgan-lang', 'zh'); });
  it('has one profile per participant and real WebP assets without private fields', () => {
    expect(new Set(participants.map(p => p.id)).size).toBe(14);
    expect(participants).toHaveLength(14);
    for (const person of participants) {
      expect(Object.keys(person).join(' ')).not.toMatch(/birth|phone|address|email/i);
      for (const path of [person.portrait, person.portraitSmall]) {
        const absolute = resolve('public', path.slice(1));
        expect(existsSync(absolute)).toBe(true);
        const bytes = readFileSync(absolute);
        expect(bytes.toString('ascii', 8, 12)).toBe('WEBP');
        expect(bytes.includes(Buffer.from('EXIF'))).toBe(false);
      }
    }
  });
  it('shows all introductions with distinct profile links', () => {
    show('/about/participants');
    expect(screen.getAllByRole('article')).toHaveLength(campCompanions.length);
    for (const name of ['张天时', '陈若容', '黄若音', '王睿康', '秋鹭', 'Nate', '小红莓']) {
      expect(screen.queryByRole('link', { name: `认识${name}` })).not.toBeInTheDocument();
    }
    expect(screen.getByRole('heading', { name: '营地伙伴' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '认识Eddie' })).toHaveAttribute('href', '/about/participants/eddie');
    expect(screen.queryByText(/生日|出生|联系方式/)).not.toBeInTheDocument();
  });
  it('preserves the existing author story association and omits absent city data', () => {
    show('/about/participants/ruby');
    expect(screen.getByRole('heading', { name: '黄若音' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /阅读伙伴故事/ })).toHaveAttribute('href', '/community-stories/all?person=article-author-ruoyin');
    expect(screen.queryByText('来自')).not.toBeInTheDocument();
    expect(screen.getByText('跳舞 · 烘焙 · 钩织 · 芭蕾舞')).toBeInTheDocument();
  });
  it('does not substitute a different person for an unknown id', () => {
    show('/about/participants/unknown');
    expect(screen.getByRole('heading', { name: '没有找到这位伙伴' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
