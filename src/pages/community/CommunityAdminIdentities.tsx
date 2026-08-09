import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Orbit, Save, Search, Tags, Users } from 'lucide-react';

import {
  CommunityEmptyState,
  CommunityErrorState,
  CommunityLoadingState,
  CommunitySurface,
  communityInputClass,
  communityPrimaryButtonClass,
  communityTextareaClass,
} from '@/components/community/CommunitySurface';
import { useCommunityUi } from '@/lib/communityUi';
import {
  getAdminIdentityStats,
  listAdminIdentityLabels,
  listAdminIdentityMembers,
  setAdminMemberIdentities,
  updateAdminIdentityLabel,
  type AdminIdentityLabel,
  type CommunityIdentityStats,
  type PlanetSlug,
} from '@/services/community-identities';

type MemberDraft = { primary: string; secondary: string[] };

const planetOptions: Array<{ slug: PlanetSlug; zh: string; en: string }> = [
  { slug: 'youth', zh: '阿柑少年圈', en: 'R-Gan Junior Circle' },
  { slug: 'support', zh: '成人支持团队', en: 'Adult Support Team' },
  { slug: 'guardian', zh: '家长守护团', en: 'Parent Guardian Circle' },
];

function emptyStats(): CommunityIdentityStats {
  return {
    declared: [],
    confirmedPrimary: [],
    planets: [],
    overlaps: [],
    pendingDeclarations: 0,
    missingPrimary: 0,
  };
}

export default function CommunityAdminIdentities() {
  const { lang, t } = useCommunityUi();
  const [labels, setLabels] = useState<AdminIdentityLabel[]>([]);
  const [members, setMembers] = useState<Awaited<ReturnType<typeof listAdminIdentityMembers>>>([]);
  const [memberDrafts, setMemberDrafts] = useState<Record<number, MemberDraft>>({});
  const [stats, setStats] = useState<CommunityIdentityStats>(emptyStats);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const labelsBySlug = useMemo(() => new Map(labels.map((label) => [label.slug, label])), [labels]);

  const load = useCallback(async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const [nextLabels, nextMembers, nextStats] = await Promise.all([
        listAdminIdentityLabels(),
        listAdminIdentityMembers(query),
        getAdminIdentityStats(),
      ]);
      setLabels(nextLabels);
      setMembers(nextMembers);
      setStats(nextStats);
      setMemberDrafts(Object.fromEntries(nextMembers.map((member) => [member.person_id, {
        primary: member.primary_identity_slug || '',
        secondary: member.secondary_identity_slugs || [],
      }])));
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : t('身份工作台读取失败。', 'Could not load the identity workspace.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void load(); }, [load]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    void load(search);
  };

  const changeLabel = <Key extends keyof AdminIdentityLabel>(id: number, key: Key, value: AdminIdentityLabel[Key]) => {
    setLabels((current) => current.map((label) => label.id === id ? { ...label, [key]: value } : label));
  };

  const saveLabel = async (label: AdminIdentityLabel) => {
    setBusyKey(`label-${label.id}`);
    setError(null);
    setNotice(null);
    try {
      await updateAdminIdentityLabel({
        id: label.id,
        nameZh: label.name_zh,
        nameEn: label.name_en,
        descriptionZh: label.description_zh,
        descriptionEn: label.description_en,
        color: label.color,
        planetSlug: label.planet_slug as PlanetSlug,
        selectableOnSignup: label.selectable_on_signup,
        isActive: label.is_active,
        sortOrder: label.sort_order,
      });
      setNotice(t('身份标签设置已保存。', 'Identity label settings saved.'));
      await load(search);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('身份标签保存失败。', 'Could not save the identity label.'));
    } finally {
      setBusyKey(null);
    }
  };

  const saveMember = async (personId: number) => {
    const draft = memberDrafts[personId];
    if (!draft?.primary) {
      setError(t('成员必须有一个主身份。', 'A member must have one primary identity.'));
      return;
    }
    setBusyKey(`member-${personId}`);
    setError(null);
    setNotice(null);
    try {
      await setAdminMemberIdentities(personId, draft.primary, draft.secondary);
      setNotice(t('成员身份已更新。', 'Member identities updated.'));
      await load(search);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('成员身份保存失败。', 'Could not save member identities.'));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <CommunitySurface
      eyebrow="Identity system"
      title={t('管理三星身份与统计。', 'Manage planet identities and statistics.')}
      description={t('自报身份只用于审核参考；正式星球、重叠关系和统计只读取管理员确认后的身份。', 'Declarations are review context only. Planets, overlaps, and statistics use confirmed identities.')}
      width="wide"
    >
      {error ? <div className="mb-5"><CommunityErrorState message={error} onRetry={() => void load(search)} /></div> : null}
      {notice ? <p className="mb-5 rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary" role="status">{notice}</p> : null}
      {loading ? <CommunityLoadingState label={t('正在整理三星身份…', 'Loading planet identities…')} variant="cards" /> : null}

      {!loading ? (
        <div className="space-y-10">
          <section aria-labelledby="identity-stats-title">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Orbit className="size-5" aria-hidden="true" /></span>
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/55">Overview</p><h2 id="identity-stats-title" className="font-serif text-2xl text-primary">{t('三星数据', 'Three-planet data')}</h2></div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <article className="rounded-2xl bg-[hsl(var(--community-orange)/0.1)] p-4"><p className="text-xs text-foreground/55">{t('待确认自报用户', 'Pending declarations')}</p><p className="mt-2 font-serif text-3xl text-[hsl(var(--community-orange))]">{stats.pendingDeclarations}</p></article>
              {planetOptions.map((planet) => (
                <article key={planet.slug} className="rounded-2xl bg-primary/[0.06] p-4"><p className="text-xs text-foreground/55">{lang === 'zh' ? planet.zh : planet.en}</p><p className="mt-2 font-serif text-3xl text-primary">{stats.planets.find((item) => item.slug === planet.slug)?.count || 0}</p></article>
              ))}
              <article className="rounded-2xl border border-[hsl(var(--community-orange)/0.24)] p-4"><p className="text-xs text-foreground/55">{t('待补齐主身份', 'Missing primary')}</p><p className="mt-2 font-serif text-3xl text-[hsl(var(--community-orange))]">{stats.missingPrimary}</p></article>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-primary/10 p-4"><h3 className="text-sm font-semibold text-primary">{t('已确认主身份', 'Confirmed primary identities')}</h3><div className="mt-3 flex flex-wrap gap-2">{stats.confirmedPrimary.map((item) => <span key={item.slug} className="rounded-full bg-secondary px-3 py-1.5 text-xs">{labelsBySlug.get(item.slug)?.name_zh || item.slug} · {item.count}</span>)}</div></div>
              <div className="rounded-2xl border border-primary/10 p-4"><h3 className="text-sm font-semibold text-primary">{t('跨星球重叠', 'Cross-planet overlaps')}</h3><div className="mt-3 flex flex-wrap gap-2">{stats.overlaps.length ? stats.overlaps.map((item) => <span key={item.planets.join('-')} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary">{item.planets.join(' ↔ ')} · {item.count}</span>) : <span className="text-xs text-foreground/50">{t('暂时没有跨星球成员', 'No cross-planet members yet')}</span>}</div></div>
            </div>
          </section>

          <section aria-labelledby="identity-labels-title">
            <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Tags className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/55">Labels</p><h2 id="identity-labels-title" className="font-serif text-2xl text-primary">{t('身份标签设置', 'Identity label settings')}</h2></div></div>
            <div className="mt-5 space-y-4">
              {labels.map((label) => (
                <article key={label.id} className="rounded-[1.4rem] border border-primary/10 bg-white/50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="size-3 rounded-full" style={{ backgroundColor: label.color || undefined }} aria-hidden="true" /><div><h3 className="font-semibold text-primary">{label.name_zh}</h3><p className="text-xs text-foreground/45">{label.slug}{label.is_core ? ` · ${t('核心标签', 'Core label')}` : ''}</p></div></div><button type="button" className={communityPrimaryButtonClass} disabled={busyKey !== null} onClick={() => void saveLabel(label)}><Save className="size-4" aria-hidden="true" />{busyKey === `label-${label.id}` ? t('保存中…', 'Saving…') : t('保存设置', 'Save')}</button></div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm font-semibold"><span>{t('中文名', 'Chinese name')}</span><input className={communityInputClass} value={label.name_zh} onChange={(event) => changeLabel(label.id, 'name_zh', event.target.value)} /></label>
                    <label className="space-y-2 text-sm font-semibold"><span>{t('英文名', 'English name')}</span><input className={communityInputClass} value={label.name_en || ''} onChange={(event) => changeLabel(label.id, 'name_en', event.target.value)} /></label>
                    <label className="space-y-2 text-sm font-semibold sm:col-span-2"><span>{t('中文说明', 'Chinese description')}</span><textarea className={communityTextareaClass} value={label.description_zh || ''} onChange={(event) => changeLabel(label.id, 'description_zh', event.target.value)} /></label>
                    <label className="space-y-2 text-sm font-semibold sm:col-span-2"><span>{t('英文说明', 'English description')}</span><textarea className={communityTextareaClass} value={label.description_en || ''} onChange={(event) => changeLabel(label.id, 'description_en', event.target.value)} /></label>
                    <label className="space-y-2 text-sm font-semibold"><span>{t('所属星球', 'Planet')}</span><select className={communityInputClass} value={label.planet_slug || 'youth'} onChange={(event) => changeLabel(label.id, 'planet_slug', event.target.value)}>{planetOptions.map((planet) => <option key={planet.slug} value={planet.slug}>{lang === 'zh' ? planet.zh : planet.en}</option>)}</select></label>
                    <label className="space-y-2 text-sm font-semibold"><span>{t('颜色', 'Color')}</span><input className={communityInputClass} type="color" value={label.color || '#006644'} onChange={(event) => changeLabel(label.id, 'color', event.target.value)} /></label>
                    <label className="flex items-center gap-3 rounded-xl bg-primary/[0.05] p-3 text-sm"><input type="checkbox" checked={label.selectable_on_signup} disabled={label.slug === 'rgan-founder'} onChange={(event) => changeLabel(label.id, 'selectable_on_signup', event.target.checked)} />{t('注册时允许自选', 'Available during registration')}</label>
                    <label className="flex items-center gap-3 rounded-xl bg-primary/[0.05] p-3 text-sm"><input type="checkbox" checked={label.is_active} onChange={(event) => changeLabel(label.id, 'is_active', event.target.checked)} />{t('标签启用', 'Label active')}</label>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="identity-members-title">
            <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Users className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/55">Members</p><h2 id="identity-members-title" className="font-serif text-2xl text-primary">{t('成员身份管理', 'Member identity management')}</h2></div></div><form className="flex w-full max-w-sm gap-2" onSubmit={submitSearch}><label className="sr-only" htmlFor="identity-member-search">{t('搜索成员', 'Search members')}</label><input id="identity-member-search" className={communityInputClass} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('自然名、显示名或用户名', 'Nature name, display name, or username')} /><button className="community-button community-button--secondary" type="submit"><Search className="size-4" aria-hidden="true" />{t('搜索', 'Search')}</button></form></div>
            <div className="mt-5 space-y-4">
              {members.map((member) => {
                const draft = memberDrafts[member.person_id] || { primary: '', secondary: [] };
                return (
                  <article key={member.person_id} className="rounded-[1.4rem] border border-primary/10 bg-white/50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-serif text-xl text-primary">{member.nature_name || member.display_name}</h3><p className="text-xs text-foreground/45">#{member.person_id} · {member.membership_status}</p></div><button type="button" className={communityPrimaryButtonClass} disabled={busyKey !== null || !draft.primary} onClick={() => void saveMember(member.person_id)}><Save className="size-4" aria-hidden="true" />{busyKey === `member-${member.person_id}` ? t('保存中…', 'Saving…') : t('保存身份', 'Save identities')}</button></div>
                    <div className="mt-4 grid gap-4 md:grid-cols-[minmax(12rem,0.75fr)_minmax(0,1.25fr)]"><label className="space-y-2 text-sm font-semibold"><span>{t('主身份 *', 'Primary identity *')}</span><select className={communityInputClass} value={draft.primary} onChange={(event) => setMemberDrafts((current) => ({ ...current, [member.person_id]: { primary: event.target.value, secondary: draft.secondary.filter((slug) => slug !== event.target.value) } }))}><option value="">{t('待补齐', 'Missing')}</option>{labels.filter((label) => label.is_active).map((label) => <option key={label.slug} value={label.slug}>{lang === 'zh' ? label.name_zh : label.name_en || label.name_zh}</option>)}</select></label><fieldset><legend className="text-sm font-semibold">{t('副身份', 'Secondary identities')}</legend><div className="mt-2 flex flex-wrap gap-2">{labels.filter((label) => label.is_active && label.slug !== draft.primary).map((label) => { const checked = draft.secondary.includes(label.slug); return <label key={label.slug} className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs ${checked ? 'border-primary bg-primary/10 text-primary' : 'border-primary/15'}`}><input type="checkbox" checked={checked} onChange={() => setMemberDrafts((current) => ({ ...current, [member.person_id]: { ...draft, secondary: checked ? draft.secondary.filter((slug) => slug !== label.slug) : [...draft.secondary, label.slug] } }))} />{lang === 'zh' ? label.name_zh : label.name_en || label.name_zh}</label>; })}</div></fieldset></div>
                  </article>
                );
              })}
              {!members.length ? <CommunityEmptyState title={t('没有找到成员', 'No members found')} description={t('尝试其他关键词；没有主身份的正式成员也会显示在这里。', 'Try another search. Active members without a primary identity also appear here.')} /> : null}
            </div>
          </section>
        </div>
      ) : null}
    </CommunitySurface>
  );
}
