import { Link, useParams } from 'react-router-dom';
import ParticipantRoster, { ParticipantPortrait } from '@/components/participants/ParticipantRoster';
import { getParticipant } from '@/content/participants';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';

export default function ParticipantDirectory() {
  const { participantId } = useParams();
  const { lang, t } = useLanguage();
  const person = participantId ? getParticipant(participantId) : undefined;
  if (participantId && !person) return <div className="participant-page">
    <h1>{t('没有找到这位伙伴', 'Companion not found')}</h1>
    <Link className="participant-link" to="/about/participants">{t('返回营地伙伴名录', 'Back to camp companions')}</Link>
  </div>;
  return <div className="participant-page" lang={lang}>
    <Link className="participant-link" to={person ? '/about/participants' : '/about#participants'}>← {person ? t('全部营地伙伴', 'All camp companions') : t('我们的团队', 'Our team')}</Link>
    {person ? <article className="participant-profile">
      <figure className="participant-profile__photo"><ParticipantPortrait person={person} eager /></figure>
      <div>
        <p className="participant-card__nature">{t('伙伴介绍', 'Meet our community')}</p>
        <h1>{pickLocalized(person.name, lang)}</h1>
        <p className="participant-profile__bio">{pickLocalized(person.bio, lang)}</p>
        <dl>
          <div><dt>{t('自然名', 'Nature name')}</dt><dd>{pickLocalized(person.natureName, lang)}</dd></div>
          {person.city && <div><dt>{t('来自', 'From')}</dt><dd>{pickLocalized(person.city, lang)}</dd></div>}
          <div><dt>{t('兴趣与特长', 'Interests')}</dt><dd>{pickLocalized(person.interests, lang)}</dd></div>
          {person.favorite && <div><dt>{t('营地最爱', 'Camp favorite')}</dt><dd>{pickLocalized(person.favorite, lang)}</dd></div>}
        </dl>
        <div className="participant-profile__links">
          {person.guardianId && <Link className="participant-link" to={`/about/guardians/${person.guardianId}`}>{t('守护团中的这位伙伴', 'Meet them in the Guardian Circle')} →</Link>}
          {person.storyPath && <Link className="participant-link" to={person.storyPath}>{t('阅读伙伴故事', 'Read their stories')} →</Link>}
          <Link className="participant-link" to="/impact#growth-stories">{t('查看成长与记录', 'Explore growth stories')} →</Link>
        </div>
      </div>
    </article> : <>
      <header className="participant-page__heading">
        <p className="participant-card__nature">{t('真实相遇 · 一起参与', 'Real encounters · Shared experiences')}</p>
        <h1>{lang === 'zh' ? '营地伙伴' : 'Camp Companions'}</h1>
        <p>{t('从一张手写的自我介绍开始，认识一起走进森林、做茶、做饭与共创的伙伴。这里保留每个人自己的兴趣和表达。', 'Meet the people who walked into forests, made tea, cooked, and created together. These profiles draw on their handwritten introductions and personal interests.')}</p>
      </header>
      <ParticipantRoster complete />
    </>}
  </div>;
}
