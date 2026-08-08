import type { ImpactRelationship } from '@/content/impact';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { ImpactReveal } from './ImpactReveal';

const nodePositions: Record<ImpactRelationship['id'], string> = {
  family: 'left-0 top-0',
  peers: 'right-0 top-0',
  place: 'bottom-0 left-0',
  public: 'bottom-0 right-0',
};

const connectorPositions: Record<ImpactRelationship['id'], string> = {
  family: '-rotate-[145deg]',
  peers: '-rotate-[35deg]',
  place: 'rotate-[145deg]',
  public: 'rotate-[35deg]',
};

export function RelationshipMap({ relationships }: { relationships: ImpactRelationship[] }) {
  const { lang, t } = useLanguage();
  const accessibleSummary = relationships
    .map((relationship) => `${pickLocalized(relationship.title, lang)}: ${pickLocalized(relationship.description, lang)}`)
    .join('；');

  return (
    <div>
      <div
        className="relative mx-auto hidden h-[31rem] max-w-4xl md:block"
        role="img"
        aria-label={t(`少年与家庭、伙伴、土地和公共行动的关系图。${accessibleSummary}`, `Relationship map connecting young people with family, peers, land, and public action. ${accessibleSummary}`)}
      >
        <div className="absolute inset-[13%] rounded-full border border-primary/15" aria-hidden="true" />
        <div className="absolute left-1/2 top-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30 bg-background p-7 text-center shadow-[0_20px_70px_hsl(var(--primary)/0.08)]">
          <div className="flex h-full flex-col items-center justify-center rounded-full bg-primary px-5 text-primary-foreground">
            <span className="font-serif text-3xl">{t('少年', 'Young person')}</span>
            <span className="mt-3 text-xs leading-5 text-primary-foreground/70">
              {t('感受、提问、协作、行动', 'Sense, question, collaborate, act')}
            </span>
          </div>
        </div>

        {relationships.map((relationship, index) => (
          <ImpactReveal
            key={relationship.id}
            delay={index * 0.05}
            className={`absolute w-60 ${nodePositions[relationship.id]}`}
          >
            <article className="rounded-2xl border border-border bg-card/95 p-6 shadow-[0_14px_45px_hsl(var(--primary)/0.06)]">
              <h3 className="font-serif text-2xl text-foreground">
                {pickLocalized(relationship.title, lang)}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {pickLocalized(relationship.description, lang)}
              </p>
            </article>
          </ImpactReveal>
        ))}

        {relationships.map((relationship) => (
          <span
            key={`${relationship.id}-connector`}
            aria-hidden="true"
            className={`absolute left-1/2 top-1/2 h-px w-[31%] origin-left bg-primary/25 ${connectorPositions[relationship.id]}`}
          />
        ))}
      </div>

      <div className="md:hidden">
        <div className="mx-auto flex size-40 flex-col items-center justify-center rounded-full bg-primary px-5 text-center text-primary-foreground">
          <span className="font-serif text-2xl">{t('少年', 'Young person')}</span>
          <span className="mt-2 text-xs leading-5 text-primary-foreground/70">
            {t('关系从这里展开', 'Relationships begin here')}
          </span>
        </div>
        <div className="mx-auto h-10 w-px bg-primary/30" aria-hidden="true" />
        <div className="space-y-3">
          {relationships.map((relationship) => (
            <article key={relationship.id} className="rounded-2xl border border-border bg-card/80 p-5">
              <h3 className="font-serif text-xl text-foreground">
                {pickLocalized(relationship.title, lang)}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {pickLocalized(relationship.description, lang)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
