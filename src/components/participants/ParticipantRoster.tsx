import { Link } from 'react-router-dom';
import { campCompanions, participantPath, type Participant } from '@/content/participants';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import './participants.css';

export function ParticipantPortrait({ person, eager = false }: { person: Participant; eager?: boolean }) {
  const { lang } = useLanguage();
  return <img
    src={person.portrait}
    srcSet={`${person.portraitSmall} 400w, ${person.portrait} 800w`}
    sizes="(max-width: 639px) 85vw, (max-width: 1023px) 45vw, 30vw"
    alt={pickLocalized(person.name, lang)}
    width={person.width}
    height={person.height}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    style={{ objectPosition: person.position }}
  />;
}

export default function ParticipantRoster({ complete = false }: { complete?: boolean }) {
  const { lang, t } = useLanguage();
  return <div className="participant-directory">
    <div className={complete ? 'participant-grid' : 'participant-rail'} aria-label={t('营地伙伴名录', 'Camp participant directory')} tabIndex={complete ? undefined : 0}>
      {campCompanions.map((person) => <article className="participant-card" key={person.id}>
        <Link className="participant-card__portrait" to={participantPath(person.id)} aria-label={t(`认识${person.name.zh}`, `Meet ${person.name.en}`)}>
          <ParticipantPortrait person={person} />
        </Link>
        <div className="participant-card__copy">
          <p className="participant-card__nature">{pickLocalized(person.natureName, lang)}{person.city ? ` · ${pickLocalized(person.city, lang)}` : ''}</p>
          <h4><Link to={participantPath(person.id)}>{pickLocalized(person.name, lang)}</Link></h4>
          <p className="participant-card__bio">{pickLocalized(person.bio, lang)}</p>
          <Link className="participant-link" to={participantPath(person.id)}>{t('认识这位伙伴', 'Meet this companion')} <span aria-hidden="true">↗</span></Link>
        </div>
      </article>)}
    </div>
    {!complete && <div className="participant-directory__footer">
      <span>{t('左右滑动，认识更多伙伴', 'Scroll sideways to meet more camp participants')}</span>
      <Link className="participant-link" to="/about/participants">{t('查看全部营地伙伴', 'View all camp participants')} <span aria-hidden="true">→</span></Link>
    </div>}
  </div>;
}

export function ParticipantEntry({ source }: { source: 'impact' | 'community' }) {
  const { lang, t } = useLanguage();
  return <section className="participant-entry" aria-labelledby={`${source}-participants-title`}>
    <div className="participant-entry__people" aria-hidden="true">
      {campCompanions.slice(0, 4).map(person => <img key={person.id} src={person.portraitSmall} width={80} height={80} alt="" loading="lazy" decoding="async" style={{ objectPosition: person.position }} />)}
    </div>
    <div>
      <p className="participant-card__nature">{t('营地伙伴 · Camp Participants', 'Camp Participants')}</p>
      <h2 id={`${source}-participants-title`}>{t('认识一起参与的伙伴', 'Meet the people who took part')}</h2>
      <p>{source === 'impact'
        ? t('记录背后，是有名字、有兴趣、有故事的人。从他们的自我介绍，继续读到他们的社区故事。', 'Behind these records are people with names, interests, and stories. Start with their introductions and explore their community stories.')
        : t('从营地里的相遇开始，认识伙伴的自然名、兴趣和故事。', 'Get to know the people we met at camp through their nature names, interests, and stories.')}</p>
      <Link className="participant-link" to="/about/participants">{lang === 'zh' ? '走进营地伙伴名录' : 'Explore the camp participant directory'} <span aria-hidden="true">→</span></Link>
    </div>
  </section>;
}
