import { Link2, Orbit } from 'lucide-react';
import type { CSSProperties } from 'react';

import type { PlanetSlug } from '@/services/community-identities';
import type { CommunityPerson } from '@/services/people';

type Translate = (zh: string, en: string) => string;

export const COMMUNITY_PLANETS: Array<{
  slug: PlanetSlug;
  zh: string;
  en: string;
  shortZh: string;
  shortEn: string;
  descriptionZh: string;
  descriptionEn: string;
  color: string;
}> = [
  {
    slug: 'youth',
    zh: '阿柑少年圈',
    en: 'R-Gan Junior Circle',
    shortZh: '少年圈',
    shortEn: 'Youth',
    descriptionZh: '发起人、青年共创伙伴与参与者',
    descriptionEn: 'Founders, youth co-creators, and participants',
    color: '#EAA160',
  },
  {
    slug: 'support',
    zh: '成人支持团队',
    en: 'Adult Support Team',
    shortZh: '支持团队',
    shortEn: 'Support',
    descriptionZh: '在两个星球之间支持、翻译与连接',
    descriptionEn: 'Supports, translates, and connects both sides',
    color: '#72B18A',
  },
  {
    slug: 'guardian',
    zh: '家长守护团',
    en: 'Parent Guardian Circle',
    shortZh: '守护团',
    shortEn: 'Guardians',
    descriptionZh: '以家庭经验、陪伴与共同守护支持成长',
    descriptionEn: 'Supports growth through family experience and care',
    color: '#8BB5C8',
  },
];

function belongsToPlanet(person: CommunityPerson, planet: PlanetSlug) {
  return person.planet_slugs?.includes(planet) || false;
}

function overlapCount(people: CommunityPerson[], first: PlanetSlug, second: PlanetSlug) {
  return people.filter((person) => belongsToPlanet(person, first) && belongsToPlanet(person, second)).length;
}

export default function CommunityPlanetNavigator({
  people,
  selectedPlanet,
  t,
  language,
  onSelect,
}: {
  people: CommunityPerson[];
  selectedPlanet: PlanetSlug;
  t: Translate;
  language: 'zh' | 'en';
  onSelect: (planet: PlanetSlug) => void;
}) {
  const youthSupportOverlap = overlapCount(people, 'youth', 'support');
  const supportGuardianOverlap = overlapCount(people, 'support', 'guardian');

  return (
    <section className="community-planet-system" aria-labelledby="community-planet-system-title">
      <div className="community-planet-system__intro">
        <div>
          <p>{t('三个星球 · 一个社群', 'Three planets · One community')}</p>
          <h2 id="community-planet-system-title">{t('沿着连接，切换你想认识的伙伴。', 'Follow the connections and choose who to meet.')}</h2>
        </div>
        <span><Link2 className="size-4" aria-hidden="true" />{t('成人支持团队连接两端', 'Adult support connects both sides')}</span>
      </div>

      <div className="community-planet-system__tabs" role="tablist" aria-label={t('选择伙伴星球', 'Choose a people planet')}>
        {COMMUNITY_PLANETS.map((planet) => {
          const count = people.filter((person) => belongsToPlanet(person, planet.slug)).length;
          return (
            <button
              key={planet.slug}
              type="button"
              role="tab"
              aria-selected={selectedPlanet === planet.slug}
              aria-controls="community-focused-planet"
              onClick={() => onSelect(planet.slug)}
            >
              <span className="community-planet-system__tab-dot" style={{ backgroundColor: planet.color }} aria-hidden="true" />
              <span>{language === 'zh' ? planet.zh : planet.en}</span>
              <strong>{count}</strong>
            </button>
          );
        })}
      </div>

      <div className="community-planet-system__scene" aria-label={t('三颗相互连通的伙伴星球', 'Three connected community planets')}>
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
          <path className="community-planet-system__bridge community-planet-system__bridge--left" d="M 245 150 C 360 70, 420 70, 500 150" />
          <path className="community-planet-system__bridge community-planet-system__bridge--right" d="M 500 150 C 580 230, 650 230, 755 150" />
        </svg>
        <span className="community-planet-system__overlap community-planet-system__overlap--left">{youthSupportOverlap} {t('位重叠伙伴', 'shared')}</span>
        <span className="community-planet-system__overlap community-planet-system__overlap--right">{supportGuardianOverlap} {t('位重叠伙伴', 'shared')}</span>

        {COMMUNITY_PLANETS.map((planet) => {
          const active = selectedPlanet === planet.slug;
          const count = people.filter((person) => belongsToPlanet(person, planet.slug)).length;
          return (
            <button
              key={planet.slug}
              type="button"
              className={`community-planet-system__planet community-planet-system__planet--${planet.slug} ${active ? 'is-active' : ''}`}
              aria-label={`${language === 'zh' ? planet.zh : planet.en}，${count} ${t('位伙伴', 'members')}`}
              aria-pressed={active}
              onClick={() => onSelect(planet.slug)}
              style={{ '--planet-color': planet.color } as CSSProperties}
            >
              <span className="community-planet-system__planet-orbit" aria-hidden="true"><i /><i /><i /></span>
              <span className="community-planet-system__planet-body">
                <Orbit aria-hidden="true" />
                <strong>{language === 'zh' ? planet.shortZh : planet.shortEn}</strong>
                <small>{count}</small>
              </span>
              <span className="community-planet-system__planet-copy">
                <strong>{language === 'zh' ? planet.zh : planet.en}</strong>
                <small>{language === 'zh' ? planet.descriptionZh : planet.descriptionEn}</small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
