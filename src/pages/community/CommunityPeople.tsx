import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CircleDotDashed,
  List,
  MapPin,
  MessageCircle,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import CommunityPeoplePlanetBoundary from '@/components/community/CommunityPeoplePlanetBoundary';
import { createAvatarIdentity } from '@/components/community/peoplePlanetModel';
import { CommunityEmptyState, CommunityErrorState, CommunityLoadingState, CommunitySurface } from '@/components/community/CommunitySurface';
import { useCommunityUi } from '@/lib/communityUi';
import { createDirectConversationWithPerson } from '@/services/messages';
import { getMyCommunityProfile } from '@/services/community-profile';
import { listCommunityPeople, type CommunityPerson } from '@/services/people';

const CommunityPeoplePlanet = lazy(() => import('@/components/community/CommunityPeoplePlanet'));

type Translate = (zh: string, en: string) => string;
type PeopleView = 'planet' | 'list';

function getDisplayName(person: CommunityPerson) {
  return person.nature_name || person.display_name;
}

function getLocation(person: CommunityPerson) {
  return [person.city, person.region, person.country].filter(Boolean).join(' · ');
}

function CommunityAvatar({ person, className = '', isOwn = false }: { person: CommunityPerson; className?: string; isOwn?: boolean }) {
  const identity = createAvatarIdentity(person.id, getDisplayName(person), isOwn);
  const style = {
    '--community-avatar-primary': identity.primary,
    '--community-avatar-secondary': identity.secondary,
    '--community-avatar-highlight': identity.highlight,
    '--community-avatar-accent': identity.accent,
  } as CSSProperties;

  return (
    <span className={`community-avatar ${className}`} style={style} aria-hidden="true">
      <span>{identity.initial}</span>
      <i />
    </span>
  );
}

function CommunityPersonCard({
  person,
  index,
  isMe,
  startingId,
  t,
  onMessage,
}: {
  person: CommunityPerson;
  index: number;
  isMe: boolean;
  startingId: number | null;
  t: Translate;
  onMessage: (personId: number) => void;
}) {
  const displayName = getDisplayName(person);
  const location = getLocation(person);

  return (
    <article className="community-person-card">
      <div className="community-person-card__topline">
        <CommunityAvatar person={person} className="community-avatar--card" isOwn={isMe} />
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <h2>{displayName}</h2>
      {person.name_zh || person.name_en ? <p className="community-person-card__names">{[person.name_zh, person.name_en].filter(Boolean).join(' / ')}</p> : null}
      {person.bio ? <p className="community-person-card__bio">{person.bio}</p> : <p className="community-person-card__bio is-empty">{t('还没有写下自我介绍。', 'No introduction yet.')}</p>}
      <div className="community-person-card__footer">
        {location ? <p className="community-person-card__location"><MapPin className="size-3.5" aria-hidden="true" />{location}</p> : null}
        {!isMe ? (
          <button type="button" className="community-person-card__message" disabled={startingId !== null} onClick={() => onMessage(person.id)}>
            <MessageCircle className="size-4" aria-hidden="true" />
            {startingId === person.id ? t('正在打开…', 'Opening…') : t('发消息', 'Message')}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </button>
        ) : <span className="community-person-card__self">{t('这是我', 'This is me')}</span>}
      </div>
    </article>
  );
}

function CommunityPersonDetail({
  person,
  isMe,
  startingId,
  t,
  formatDate,
  onMessage,
}: {
  person: CommunityPerson | null;
  isMe: boolean;
  startingId: number | null;
  t: Translate;
  formatDate: (value: string | number | Date) => string;
  onMessage: (personId: number) => void;
}) {
  if (!person) {
    return (
      <aside className="community-people-planet__detail is-empty" aria-live="polite">
        <span className="community-people-planet__detail-icon"><Sparkles className="size-5" aria-hidden="true" /></span>
        <h2>{t('转动星球，遇见一位伙伴', 'Turn the planet and meet someone')}</h2>
        <p>{t('点击一颗星，或从下方伙伴索引中选择。', 'Choose a star, or select someone from the people index below.')}</p>
      </aside>
    );
  }

  const displayName = getDisplayName(person);
  const location = getLocation(person);

  return (
    <aside className="community-people-planet__detail" aria-live="polite">
      <CommunityAvatar person={person} className="community-avatar--detail" isOwn={isMe} />
      <p className="community-people-planet__detail-kicker">{isMe ? t('我的位置', 'My place') : t('星球伙伴', 'Planet member')}</p>
      <h2>{displayName}</h2>
      {person.name_zh || person.name_en ? <p className="community-people-planet__names">{[person.name_zh, person.name_en].filter(Boolean).join(' / ')}</p> : null}
      <p className="community-people-planet__bio">{person.bio || t('这位伙伴还没有写下自我介绍。', 'This member has not added an introduction yet.')}</p>
      <div className="community-people-planet__meta">
        {location ? <span><MapPin className="size-3.5" aria-hidden="true" />{location}</span> : null}
        <span><CircleDotDashed className="size-3.5" aria-hidden="true" />{t('加入于', 'Joined')} {formatDate(person.joined_at)}</span>
      </div>
      {!isMe ? (
        <button type="button" className="community-people-planet__message" disabled={startingId !== null} onClick={() => onMessage(person.id)}>
          <MessageCircle className="size-4" aria-hidden="true" />
          {startingId === person.id ? t('正在打开…', 'Opening…') : t('发一条消息', 'Send a message')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      ) : <span className="community-people-planet__self">{t('橙色光环标记了你的位置', 'The orange halo marks your place')}</span>}
    </aside>
  );
}

function CommunityPlanetLoading({ t }: { t: Translate }) {
  return (
    <div className="community-people-planet__loading" role="status">
      <span aria-hidden="true"><span /></span>
      <p>{t('正在点亮伙伴星球…', 'Lighting the people planet…')}</p>
    </div>
  );
}

export default function CommunityPeople() {
  const navigate = useNavigate();
  const reducedMotion = Boolean(useReducedMotion());
  const { t, formatDate } = useCommunityUi();
  const [people, setPeople] = useState<CommunityPerson[]>([]);
  const [ownPersonId, setOwnPersonId] = useState<number | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [view, setView] = useState<PeopleView>('planet');
  const [autoRotate, setAutoRotate] = useState(!reducedMotion);
  const [resetVersion, setResetVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPerson = useMemo(
    () => people.find((person) => person.id === selectedPersonId) || null,
    [people, selectedPersonId],
  );

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([listCommunityPeople(), getMyCommunityProfile()])
      .then(([rows, profile]) => {
        setPeople(rows);
        setOwnPersonId(profile?.person_id || null);
        setSelectedPersonId((current) => current && rows.some((person) => person.id === current) ? current : null);
      })
      .catch((readError) => setError(readError instanceof Error ? readError.message : t('伙伴目录读取失败。', 'Could not load the people directory.')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (reducedMotion) setAutoRotate(false);
  }, [reducedMotion]);

  const startConversation = async (personId: number) => {
    setStartingId(personId);
    setError(null);
    try {
      const conversationId = await createDirectConversationWithPerson(personId);
      navigate(`/community/messages?conversation=${conversationId}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : t('暂时不能发起私聊。', 'A conversation cannot be started right now.'));
    } finally {
      setStartingId(null);
    }
  };

  const selectPerson = (personId: number) => {
    setSelectedPersonId(personId);
    setAutoRotate(false);
  };

  const resetPlanet = () => {
    setSelectedPersonId(null);
    setAutoRotate(!reducedMotion);
    setResetVersion((current) => current + 1);
  };

  return (
    <CommunitySurface
      eyebrow="People planet"
      title={t('转动星球，看见彼此发光。', 'Turn the planet. See each other shine.')}
      description={t('每一颗星都是一位选择在社群中被看见的正式成员。星轨只是视觉引导，不代表真实社交关系。', 'Every star is an active member who chose to be visible here. The trails are visual guides, not representations of real relationships.')}
      width="wide"
    >
      {loading ? <CommunityLoadingState label={t('正在寻找社群伙伴…', 'Finding community members…')} variant="cards" /> : null}
      {!loading && error ? <CommunityErrorState message={error} onRetry={load} /> : null}
      {!loading && people.length ? (
        <div className="community-people-explorer community-people-explorer--night">
          <div className="community-people-explorer__toolbar">
            <div className="community-people-explorer__modes" role="group" aria-label={t('伙伴浏览方式', 'People view')}>
              <button type="button" aria-pressed={view === 'planet'} onClick={() => setView('planet')}>
                <CircleDotDashed className="size-4" aria-hidden="true" />{t('星球', 'Planet')}
              </button>
              <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
                <List className="size-4" aria-hidden="true" />{t('名单', 'List')}
              </button>
            </div>

            {view === 'planet' ? (
              <div className="community-people-explorer__controls">
                <span className="community-people-explorer__live"><i />{people.length} {t('位伙伴在线展示', 'people in the constellation')}</span>
                <button type="button" disabled={reducedMotion} onClick={() => setAutoRotate((current) => !current)}>
                  {autoRotate ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
                  {reducedMotion ? t('已减少动效', 'Reduced motion') : autoRotate ? t('暂停', 'Pause') : t('继续', 'Resume')}
                </button>
                <button type="button" onClick={resetPlanet}>
                  <RotateCcw className="size-4" aria-hidden="true" />{t('重置视角', 'Reset view')}
                </button>
              </div>
            ) : null}
          </div>

          {view === 'planet' ? (
            <>
              <div className="community-people-planet-layout">
                <div className="community-people-planet-stage">
                  <CommunityPeoplePlanetBoundary fallback={(
                    <div className="community-people-planet__fallback" role="status">
                      <CircleDotDashed className="size-8" aria-hidden="true" />
                      <p>{t('当前设备无法显示 3D 星球，你仍可以使用伙伴名单。', 'This device cannot display the 3D planet. The people list is still available.')}</p>
                      <button type="button" onClick={() => setView('list')}>{t('打开名单', 'Open list')}</button>
                    </div>
                  )}>
                    <Suspense fallback={<CommunityPlanetLoading t={t} />}>
                      <CommunityPeoplePlanet
                        people={people}
                        ariaLabel={t('可旋转的伙伴星球', 'Rotatable community people planet')}
                        selectedPersonId={selectedPersonId}
                        ownPersonId={ownPersonId}
                        autoRotate={autoRotate}
                        reducedMotion={reducedMotion}
                        resetVersion={resetVersion}
                        onSelect={selectPerson}
                      />
                    </Suspense>
                  </CommunityPeoplePlanetBoundary>

                  <div className="community-people-planet__hint" aria-hidden="true">
                    <MousePointer2 className="size-3.5" />{t('拖拽夜空 · 点击头像', 'Drag the sky · Select an Avatar')}
                  </div>

                  <CommunityPersonDetail
                    person={selectedPerson}
                    isMe={selectedPerson?.id === ownPersonId}
                    startingId={startingId}
                    t={t}
                    formatDate={formatDate}
                    onMessage={(personId) => void startConversation(personId)}
                  />
                </div>
              </div>

              <section className="community-people-index" aria-labelledby="community-people-index-title">
                <div className="community-people-index__heading">
                  <div>
                    <p>{t('伙伴索引', 'People index')}</p>
                    <h2 id="community-people-index-title">{t('从名字出发，也能抵达同一颗星。', 'Start with a name and reach the same star.')}</h2>
                  </div>
                  <span>{people.length}</span>
                </div>
                <div className="community-people-index__list">
                  {people.map((person) => {
                    const displayName = getDisplayName(person);
                    const isMe = person.id === ownPersonId;
                    return (
                      <button key={person.id} type="button" aria-pressed={person.id === selectedPersonId} onClick={() => selectPerson(person.id)}>
                        <CommunityAvatar person={person} className="community-avatar--index" isOwn={isMe} />
                        <span>{displayName}{isMe ? ` · ${t('我', 'Me')}` : ''}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            <div className="community-people-list">
              {people.map((person, index) => (
                <CommunityPersonCard
                  key={person.id}
                  person={person}
                  index={index}
                  isMe={person.id === ownPersonId}
                  startingId={startingId}
                  t={t}
                  onMessage={(personId) => void startConversation(personId)}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
      {!loading && !error && !people.length ? <CommunityEmptyState title={t('伙伴们还在准备资料', 'Profiles are still taking shape')} description={t('当正式成员选择在目录中出现时，你会在这里看见他们。', 'Members will appear here when they choose to share their profile.')} /> : null}
    </CommunitySurface>
  );
}
