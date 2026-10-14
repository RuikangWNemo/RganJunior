import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import type { FieldNote } from '@/types/field-notes';

export function FeaturedReader({ notes }: { notes: FieldNote[] }) {
  const { lang, t } = useLanguage();
  const [selected, setSelected] = useState('');
  if (!notes.length) return null;
  const current = Math.max(0, notes.findIndex((note) => note.slug === selected));
  const active = notes[current];
  const move = (step: number) => setSelected(notes[(current + step + notes.length) % notes.length].slug);

  return (
    <Tabs value={active.slug} onValueChange={setSelected} className="featured-reader">
      <div className="featured-reader__controls">
        <p aria-live="polite" aria-atomic="true" className="tabular-nums">
          {t('精选阅读', 'Selected reading')} <span>{String(current + 1).padStart(2, '0')} / {String(notes.length).padStart(2, '0')}</span>
        </p>
        {notes.length > 1 ? <div className="flex gap-2">
          <button type="button" onClick={() => move(-1)} aria-label={t('上一篇精选', 'Previous featured article')}><ArrowLeft aria-hidden="true" size={19} /></button>
          <button type="button" onClick={() => move(1)} aria-label={t('下一篇精选', 'Next featured article')}><ArrowRight aria-hidden="true" size={19} /></button>
        </div> : null}
      </div>
      {notes.map((note) => <TabsContent key={note.slug} value={note.slug} className="featured-reader__panel">
        <div className="featured-reader__stage">
          <Link to={`/field-notes/${note.slug}`} className="featured-reader__image" aria-label={t(`阅读：${note.title.zh}`, `Read: ${note.title.en}`)}>
            <img src={note.cover} alt={pickLocalized(note.coverAlt, lang)} decoding="async" />
          </Link>
          <div className="featured-reader__copy">
            <p className="featured-reader__byline">{note.authors.map((author) => pickLocalized(author.name, lang)).join(' · ')}<span aria-hidden="true"> / </span>{t(`${note.readingMinutes} 分钟阅读`, `${note.readingMinutes} min read`)}</p>
            <h3 className="text-balance font-serif">{pickLocalized(note.title, lang)}</h3>
            <p className="featured-reader__excerpt text-pretty">{pickLocalized(note.excerpt, lang)}</p>
            <Link to={`/field-notes/${note.slug}`} className="featured-reader__read">{t('走进这篇故事', 'Read this story')}<ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
        </div>
      </TabsContent>)}
      <TabsList aria-label={t('选择精选文章', 'Choose a featured article')} className="featured-reader__tabs">
        {notes.map((note, index) => <TabsTrigger key={note.slug} value={note.slug} title={pickLocalized(note.title, lang)} className="featured-reader__tab">
          <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          <span>{pickLocalized(note.title, lang)}</span>
        </TabsTrigger>)}
      </TabsList>
    </Tabs>
  );
}
