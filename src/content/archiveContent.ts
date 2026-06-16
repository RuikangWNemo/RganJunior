import type { LocalizedText } from '@/lib/brand';

export type ArchiveKind = 'photo' | 'document' | 'diagram' | 'illustration';

export interface ArchiveItem {
  id: string;
  src: string;
  alt: LocalizedText;
  title: LocalizedText;
  meta?: LocalizedText;
  caption?: LocalizedText;
  kind: ArchiveKind;
  aspectClassName?: string;
  fit?: 'cover' | 'contain';
  objectPosition?: string;
}

export interface ArchiveSection {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  items: ArchiveItem[];
}

export interface JoinEntryCard {
  id: string;
  audience: LocalizedText;
  label: LocalizedText;
  item: ArchiveItem;
}

const ARCHIVE_ROOT = '/archive/elements';

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

const item = (
  id: string,
  path: string,
  kind: ArchiveKind,
  title: LocalizedText,
  meta?: LocalizedText,
  caption?: LocalizedText,
  options: Partial<ArchiveItem> = {},
): ArchiveItem => ({
  id,
  src: `${ARCHIVE_ROOT}/${path}`,
  alt: title,
  title,
  meta,
  caption,
  kind,
  ...options,
});

export const homeOriginFigure = item(
  'home-origin-aerial',
  'photos/site-ecology/s03-xilai-aerial-view.jpg',
  'photo',
  text('西来古镇航拍', 'Aerial view of Xilai'),
  text('蒲江，四川', 'Pujiang, Sichuan'),
  text('田地、村落与道路关系。', 'Fields, village fabric, and road connections.'),
  {
    aspectClassName: 'aspect-[4/5]',
    objectPosition: 'center 44%',
  },
);

export const homeOutcomeCards: ArchiveItem[] = [
  item(
    'home-journal-cover',
    'graphics/publications/s17-ysa-journal-cover-page.png',
    'document',
    text('YSA Journal 论文封面', 'YSA Journal cover page'),
    text('研究发表，2024', 'Research publication, 2024'),
    text('论文发表页面。', 'Published journal page.'),
    {
      aspectClassName: 'aspect-[4/5]',
    },
  ),
  item(
    'home-claremont-poster',
    'graphics/publications/s18-claremont-forum-poster.png',
    'document',
    text('克莱蒙论坛海报', 'Claremont forum poster'),
    text('线上特别活动，2024', 'Online special forum, 2024'),
    text('论坛活动资料页。', 'Forum program material.'),
    {
      aspectClassName: 'aspect-[4/5]',
    },
  ),
  item(
    'home-csa-illustration',
    'graphics/branding/s25-campus-csa-eco-box-illustration.png',
    'illustration',
    text('校园 CSA 盲盒插画', 'Campus CSA eco-box illustration'),
    text('3.0 阶段', 'Phase 3.0'),
    text('校园 CSA 视觉资料。', 'Campus CSA visual material.'),
    {
      aspectClassName: 'aspect-[4/5]',
    },
  ),
];

export const aboutHeroFigure = homeOriginFigure;

export const aboutContextFigures: ArchiveItem[] = [
  item(
    'about-site-map',
    'graphics/infographics/s01-xilai-town-site-map.png',
    'diagram',
    text('西来镇与铁牛村位置图', 'Xilai and Tieniu location map'),
    text('场地关系图', 'Site relationship map'),
    text('古镇、车站与村落位置。', 'Town, station, and village positions.'),
    {
      aspectClassName: 'aspect-[5/4]',
    },
  ),
  item(
    'about-linpan-poster',
    'graphics/infographics/s06-traditional-linpan-land-use-poster.jpg',
    'document',
    text('川西林盘用地示意', 'Traditional Linpan land-use poster'),
    text('场地结构', 'Spatial structure'),
    text('院落、林地、水体与果园。', 'Courtyard, woods, ponds, and orchard areas.'),
    {
      aspectClassName: 'aspect-[5/4]',
    },
  ),
];

export const aboutRepairFigures: ArchiveItem[] = [
  item(
    'about-soil-damage',
    'photos/site-ecology/s04-soil-root-damage.jpg',
    'photo',
    text('土壤与根系损伤', 'Soil and root damage'),
    text('2021', '2021'),
    text('板结与根系状态。', 'Compaction and root condition.'),
    {
      aspectClassName: 'aspect-[4/3]',
    },
  ),
  item(
    'about-herbicide',
    'photos/site-ecology/s04-herbicide-ground-cover.jpg',
    'photo',
    text('除草剂使用现场', 'Herbicide ground cover'),
    text('2021', '2021'),
    text('单一管理方式下的地表。', 'Ground cover under monoculture management.'),
    {
      aspectClassName: 'aspect-[4/3]',
    },
  ),
  item(
    'about-earthworm',
    'photos/site-ecology/s09-earthworm-soil-recovery.jpg',
    'photo',
    text('蚯蚓与土壤恢复', 'Earthworm and soil recovery'),
    text('2024', '2024'),
    text('修复阶段的土壤迹象。', 'A visible sign of soil repair.'),
    {
      aspectClassName: 'aspect-[4/3]',
    },
  ),
  item(
    'about-regenerative-practice',
    'photos/site-ecology/s09-regenerative-farming-practice.jpg',
    'photo',
    text('再生农业实践现场', 'Regenerative farming practice'),
    text('2024', '2024'),
    text('种养与地面管理状态。', 'Field management and mixed cultivation conditions.'),
    {
      aspectClassName: 'aspect-[4/3]',
    },
  ),
];

export const journeyEvidenceSections: ArchiveSection[] = [
  {
    id: 'phase-1',
    title: text('1.0 现场记录', '1.0 Field Records'),
    description: text('2023.02-06', '2023.02-06'),
    items: [
      item(
        'journey-stage-performance',
        'photos/program-activities/s11-stage-performance.jpg',
        'photo',
        text('舞台展示', 'Stage performance'),
        text('阿柑少年 1.0', 'R’gan Junior 1.0'),
        text('活动现场。', 'Program scene.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-orchard-practice',
        'photos/program-activities/s11-orchard-field-practice.jpg',
        'photo',
        text('果园田野实践', 'Orchard field practice'),
        text('阿柑少年 1.0', 'R’gan Junior 1.0'),
        text('果园中的现场活动。', 'Activity in the orchard.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-making-workshop',
        'photos/program-activities/s11-hands-on-making-workshop.jpg',
        'photo',
        text('手作工作坊', 'Hands-on workshop'),
        text('阿柑少年 1.0', 'R’gan Junior 1.0'),
        text('制作与讨论场景。', 'Making and discussion session.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-cleanup',
        'photos/program-activities/s11-community-service-cleanup.jpg',
        'photo',
        text('社区清洁服务', 'Community cleanup'),
        text('阿柑少年 1.0', 'R’gan Junior 1.0'),
        text('服务行动现场。', 'Service activity on site.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
    ],
  },
  {
    id: 'phase-2',
    title: text('2.0 研究与发表', '2.0 Research and Publication'),
    description: text('2023.09-2024.05', '2023.09-2024.05'),
    items: [
      item(
        'journey-ctb-booth',
        'photos/academic-forum/s16-ctb-forum-team-booth.jpg',
        'photo',
        text('CTB 展位合影', 'CTB team booth'),
        text('论坛现场，2024', 'Forum site, 2024'),
        text('论坛展示现场。', 'Forum exhibition scene.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-ctb-medal',
        'photos/academic-forum/s16-ctb-award-medal.jpg',
        'photo',
        text('CTB 奖牌', 'CTB award medal'),
        text('论坛成果，2024', 'Forum result, 2024'),
        text('赛事奖牌记录。', 'Award medal record.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-ctb-poster',
        'photos/academic-forum/s16-ctb-poster-presentation.jpg',
        'photo',
        text('CTB 海报展示', 'CTB poster presentation'),
        text('论坛现场，2024', 'Forum site, 2024'),
        text('海报讲解场景。', 'Poster presentation scene.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-journal-cover',
        'graphics/publications/s17-ysa-journal-cover-page.png',
        'document',
        text('YSA Journal 封面页', 'YSA Journal cover page'),
        text('论文发表，2024', 'Journal publication, 2024'),
        text('研究成果封面。', 'Research publication cover.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-journal-spread',
        'graphics/publications/s17-ysa-journal-spread.png',
        'document',
        text('YSA Journal 内页', 'YSA Journal spread'),
        text('论文发表，2024', 'Journal publication, 2024'),
        text('论文双页内容。', 'Two-page journal spread.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-claremont-screen',
        'graphics/publications/s18-claremont-online-forum-screenshot.png',
        'document',
        text('克莱蒙论坛线上截图', 'Claremont online forum screenshot'),
        text('线上特别活动，2024', 'Online special forum, 2024'),
        text('远程论坛界面记录。', 'Remote forum interface record.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
    ],
  },
  {
    id: 'phase-3',
    title: text('2.5 / 3.0 实践延伸', '2.5 / 3.0 Practice Extension'),
    description: text('2024-至今', '2024-present'),
    items: [
      item(
        'journey-eco-camp',
        'photos/program-activities/s20-regenerative-design-eco-camp-group.jpg',
        'photo',
        text('再生设计国际生态营', 'Regenerative design eco camp'),
        text('2024.05', '2024.05'),
        text('生态营合影。', 'Camp group photograph.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-rural-camp',
        'photos/program-activities/s21-tieniu-youth-rural-practice-camp-group.jpg',
        'photo',
        text('铁牛青年乡建实践营', 'Tieniu youth rural practice camp'),
        text('2025.07', '2025.07'),
        text('实践营合影。', 'Practice camp group photograph.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-yale-visit',
        'photos/program-activities/s22-yale-professor-visit-portrait.jpg',
        'photo',
        text('接待耶鲁大学教授', 'Visit with Yale professor'),
        text('2025.04', '2025.04'),
        text('来访交流现场。', 'Visit and exchange scene.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-art-delegation',
        'photos/program-activities/s23-art-education-delegation-visit.jpg',
        'photo',
        text('美育教育参访团来访', 'Art education delegation visit'),
        text('2025.09', '2025.09'),
        text('参访交流记录。', 'Delegation visit record.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'journey-campus-csa',
        'graphics/branding/s25-campus-csa-eco-box-illustration.png',
        'illustration',
        text('校园 CSA 插画', 'Campus CSA illustration'),
        text('阿柑少年 3.0', 'R’gan Junior 3.0'),
        text('校园实验室视觉资料。', 'Campus lab visual material.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
    ],
  },
];

export const journeyResearchDocuments: ArchiveItem[] = [
  item(
    'journey-claremont-poster',
    'graphics/publications/s18-claremont-forum-poster.png',
    'document',
    text('克莱蒙论坛海报', 'Claremont forum poster'),
    text('线上特别活动，2024', 'Online special forum, 2024'),
    text('论坛海报资料页。', 'Forum poster material.'),
    {
      aspectClassName: 'aspect-[4/5]',
    },
  ),
  item(
    'journey-journal-cover-large',
    'graphics/publications/s17-ysa-journal-cover-page.png',
    'document',
    text('YSA Journal 封面', 'YSA Journal cover'),
    text('论文发表，2024', 'Journal publication, 2024'),
    text('论文封面资料。', 'Journal cover material.'),
    {
      aspectClassName: 'aspect-[4/5]',
    },
  ),
  item(
    'journey-journal-spread-large',
    'graphics/publications/s17-ysa-journal-spread.png',
    'document',
    text('YSA Journal 内页', 'YSA Journal spread'),
    text('论文发表，2024', 'Journal publication, 2024'),
    text('论文双页资料。', 'Two-page journal material.'),
    {
      aspectClassName: 'aspect-[5/4]',
    },
  ),
];

export const fieldResearchSections: ArchiveSection[] = [
  {
    id: 'site-context',
    title: text('场地与空间', 'Site and Spatial Context'),
    description: text('场地、林盘、果园与建筑', 'Site, Linpan, orchard, and built elements'),
    items: [
      homeOriginFigure,
      item(
        'field-linpan-aerial',
        'photos/site-ecology/s06-linpan-aerial-overview.jpg',
        'photo',
        text('林盘航拍', 'Linpan aerial overview'),
        text('场地鸟瞰', 'Aerial overview'),
        text('林盘与果园空间关系。', 'Relationship between Linpan and orchard spaces.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'field-orchard-overview',
        'photos/site-ecology/s08-orchard-garden-overview.jpg',
        'photo',
        text('果园全景', 'Orchard overview'),
        text('2020-2023', '2020-2023'),
        text('果园与活动空间。', 'Orchard and activity space.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'field-eco-buildings',
        'photos/site-ecology/s08-eco-buildings-in-orchard.jpg',
        'photo',
        text('果园中的生态建筑', 'Eco buildings in the orchard'),
        text('2020-2023', '2020-2023'),
        text('建筑与果园并置状态。', 'Buildings placed within the orchard.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
    ],
  },
  {
    id: 'problem-repair',
    title: text('问题与修复', 'Problem and Repair'),
    description: text('土壤、地表与修复迹象', 'Soil, ground cover, and repair indicators'),
    items: [
      item(
        'field-spraying',
        'photos/site-ecology/s02-orchard-spraying-scene.jpg',
        'photo',
        text('果园喷洒场景', 'Orchard spraying scene'),
        text('单一种植阶段', 'Monoculture stage'),
        text('管理现场记录。', 'Management scene record.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'field-soil-damage',
        'photos/site-ecology/s04-soil-root-damage.jpg',
        'photo',
        text('土壤板结与根系损伤', 'Compaction and root damage'),
        text('2021', '2021'),
        text('土壤状态记录。', 'Soil condition record.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'field-herbicide-ground',
        'photos/site-ecology/s04-herbicide-ground-cover.jpg',
        'photo',
        text('除草剂后的地表', 'Ground cover after herbicide use'),
        text('2021', '2021'),
        text('地表状态记录。', 'Ground condition record.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'field-soil-closeup',
        'photos/site-ecology/s09-soil-compaction-closeup.png',
        'photo',
        text('土壤近景', 'Soil close-up'),
        text('修复前后观察', 'Repair observation'),
        text('土壤细部状态。', 'Close observation of soil condition.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
      item(
        'field-earthworm-recovery',
        'photos/site-ecology/s09-earthworm-soil-recovery.jpg',
        'photo',
        text('蚯蚓出现', 'Earthworm recovery'),
        text('2024', '2024'),
        text('修复迹象记录。', 'Observed repair indicator.'),
        { aspectClassName: 'aspect-[4/3]' },
      ),
    ],
  },
  {
    id: 'systems-diagrams',
    title: text('系统图解', 'Systems and Diagrams'),
    description: text('位置、林盘与修复路径', 'Location, Linpan, and repair pathways'),
    items: [
      item(
        'field-map-diagram',
        'graphics/infographics/s01-xilai-town-site-map.png',
        'diagram',
        text('场地位置图', 'Site location map'),
        text('西来镇 / 铁牛村', 'Xilai / Tieniu'),
        text('古镇与村落位置关系。', 'Relationship between town and village.'),
        { aspectClassName: 'aspect-[5/4]' },
      ),
      item(
        'field-biodiversity-diagram',
        'graphics/infographics/s05-linpan-biodiversity-restoration-diagram.png',
        'diagram',
        text('林盘生物多样性修复图', 'Linpan biodiversity restoration diagram'),
        text('修复前后', 'Before and after'),
        text('单一种植到多样共生。', 'From monoculture to diversity.'),
        { aspectClassName: 'aspect-[5/4]' },
      ),
      item(
        'field-solution-board',
        'graphics/infographics/s07-ecological-agri-product-solution-board.png',
        'diagram',
        text('生态家园路径图', 'Ecological home pathway board'),
        text('9亩 - 9900亩', '9 mu - 9900 mu'),
        text('阶段性路径图。', 'Phased pathway board.'),
        { aspectClassName: 'aspect-[5/4]' },
      ),
    ],
  },
];

export const actionsGalleryItems: ArchiveItem[] = [
  item(
    'actions-stage-performance',
    'photos/program-activities/s11-stage-performance.jpg',
    'photo',
    text('舞台展示', 'Stage performance'),
    text('2023', '2023'),
    text('活动片段。', 'Program fragment.'),
    { aspectClassName: 'aspect-[4/3]' },
  ),
  item(
    'actions-orchard-practice',
    'photos/program-activities/s11-orchard-field-practice.jpg',
    'photo',
    text('果园田野实践', 'Orchard field practice'),
    text('2023', '2023'),
    text('果园活动片段。', 'Orchard activity fragment.'),
    { aspectClassName: 'aspect-square' },
  ),
  item(
    'actions-workshop',
    'photos/program-activities/s11-hands-on-making-workshop.jpg',
    'photo',
    text('手作工作坊', 'Hands-on workshop'),
    text('2023', '2023'),
    text('制作场景。', 'Workshop scene.'),
    { aspectClassName: 'aspect-[3/4]' },
  ),
  item(
    'actions-cleanup',
    'photos/program-activities/s11-community-service-cleanup.jpg',
    'photo',
    text('社区清洁服务', 'Community cleanup'),
    text('2023', '2023'),
    text('服务行动片段。', 'Service action fragment.'),
    { aspectClassName: 'aspect-[4/3]' },
  ),
  item(
    'actions-eco-camp',
    'photos/program-activities/s20-regenerative-design-eco-camp-group.jpg',
    'photo',
    text('再生设计国际生态营', 'Regenerative design eco camp'),
    text('2024.05', '2024.05'),
    text('生态营合影。', 'Camp group photograph.'),
    { aspectClassName: 'aspect-[4/3]' },
  ),
  item(
    'actions-rural-camp',
    'photos/program-activities/s21-tieniu-youth-rural-practice-camp-group.jpg',
    'photo',
    text('铁牛青年乡建实践营', 'Tieniu youth rural practice camp'),
    text('2025.07', '2025.07'),
    text('实践营合影。', 'Practice camp group photograph.'),
    { aspectClassName: 'aspect-square' },
  ),
  item(
    'actions-yale-casual',
    'photos/program-activities/s22-yale-professor-visit-casual.jpg',
    'photo',
    text('耶鲁来访交流', 'Yale visit exchange'),
    text('2025.04', '2025.04'),
    text('来访交流现场。', 'Visit exchange scene.'),
    { aspectClassName: 'aspect-[3/4]' },
  ),
  item(
    'actions-yale-portrait',
    'photos/program-activities/s22-yale-professor-visit-portrait.jpg',
    'photo',
    text('耶鲁来访合影', 'Yale visit portrait'),
    text('2025.04', '2025.04'),
    text('人物合影。', 'Portrait record.'),
    { aspectClassName: 'aspect-[4/3]' },
  ),
  item(
    'actions-art-visit',
    'photos/program-activities/s23-art-education-delegation-visit.jpg',
    'photo',
    text('美育教育参访团', 'Art education delegation'),
    text('2025.09', '2025.09'),
    text('参访交流片段。', 'Delegation visit fragment.'),
    { aspectClassName: 'aspect-square' },
  ),
  item(
    'actions-ctb-conversation',
    'photos/academic-forum/s16-ctb-forum-conversation.jpg',
    'photo',
    text('CTB 论坛交流', 'CTB forum conversation'),
    text('2024', '2024'),
    text('论坛交流现场。', 'Forum conversation scene.'),
    { aspectClassName: 'aspect-[3/4]' },
  ),
  item(
    'actions-ctb-booth',
    'photos/academic-forum/s16-ctb-forum-team-booth.jpg',
    'photo',
    text('CTB 展位现场', 'CTB booth scene'),
    text('2024', '2024'),
    text('展位展示片段。', 'Booth presentation fragment.'),
    { aspectClassName: 'aspect-[4/3]' },
  ),
];

export const voiceNotes: ArchiveItem[] = [
  item(
    'voice-orchard-note',
    'photos/program-activities/s11-orchard-field-practice.jpg',
    'photo',
    text('果园田野实践', 'Orchard field practice'),
    text('现场片段，2023', 'Field note, 2023'),
    text('果园中的学习活动。', 'Learning activity in the orchard.'),
    { aspectClassName: 'aspect-[5/4]' },
  ),
  item(
    'voice-cleanup-note',
    'photos/program-activities/s11-community-service-cleanup.jpg',
    'photo',
    text('社区清洁服务', 'Community cleanup'),
    text('现场片段，2023', 'Field note, 2023'),
    text('服务行动记录。', 'Service action record.'),
    { aspectClassName: 'aspect-[5/4]' },
  ),
  item(
    'voice-ctb-note',
    'photos/academic-forum/s16-ctb-poster-presentation.jpg',
    'photo',
    text('CTB 海报展示', 'CTB poster presentation'),
    text('现场片段，2024', 'Field note, 2024'),
    text('论坛展示记录。', 'Forum presentation record.'),
    { aspectClassName: 'aspect-[5/4]' },
  ),
  item(
    'voice-eco-camp-note',
    'photos/program-activities/s20-regenerative-design-eco-camp-group.jpg',
    'photo',
    text('再生设计国际生态营', 'Regenerative design eco camp'),
    text('现场片段，2024', 'Field note, 2024'),
    text('营地合影记录。', 'Camp group record.'),
    { aspectClassName: 'aspect-[5/4]' },
  ),
];

export const joinEntryCards: JoinEntryCard[] = [
  {
    id: 'join-youth',
    audience: text('面向青少年', 'For Youth'),
    label: text('田野实践', 'Field Practice'),
    item: item(
      'join-youth-image',
      'photos/program-activities/s11-orchard-field-practice.jpg',
      'photo',
      text('果园田野实践', 'Orchard field practice'),
      text('活动现场', 'Program scene'),
      text('果园中的学习活动。', 'Learning activity in the orchard.'),
      { aspectClassName: 'aspect-[4/3]' },
    ),
  },
  {
    id: 'join-parents',
    audience: text('面向家长', 'For Parents'),
    label: text('生态营', 'Eco Camp'),
    item: item(
      'join-parents-image',
      'photos/program-activities/s20-regenerative-design-eco-camp-group.jpg',
      'photo',
      text('再生设计国际生态营', 'Regenerative design eco camp'),
      text('活动现场', 'Program scene'),
      text('营地合影。', 'Camp group photograph.'),
      { aspectClassName: 'aspect-[4/3]' },
    ),
  },
  {
    id: 'join-partners',
    audience: text('合作伙伴', 'Partners'),
    label: text('来访交流', 'Site Visit'),
    item: item(
      'join-partners-image',
      'photos/program-activities/s22-yale-professor-visit-casual.jpg',
      'photo',
      text('耶鲁来访交流', 'Yale visit exchange'),
      text('合作与参访', 'Visit and collaboration'),
      text('交流现场记录。', 'Exchange scene record.'),
      { aspectClassName: 'aspect-[4/3]' },
    ),
  },
];

export const joinEvidenceItems: ArchiveItem[] = [
  item(
    'join-evidence-journal',
    'graphics/publications/s17-ysa-journal-cover-page.png',
    'document',
    text('YSA Journal 封面', 'YSA Journal cover'),
    text('研究发表，2024', 'Journal publication, 2024'),
    text('研究成果资料。', 'Research result material.'),
    { aspectClassName: 'aspect-[4/5]' },
  ),
  item(
    'join-evidence-claremont',
    'graphics/publications/s18-claremont-forum-poster.png',
    'document',
    text('克莱蒙论坛海报', 'Claremont forum poster'),
    text('论坛活动，2024', 'Forum event, 2024'),
    text('论坛资料页。', 'Forum material page.'),
    { aspectClassName: 'aspect-[4/5]' },
  ),
  item(
    'join-evidence-csa',
    'graphics/branding/s25-campus-csa-eco-box-illustration.png',
    'illustration',
    text('校园 CSA 插画', 'Campus CSA illustration'),
    text('项目视觉资料', 'Project visual material'),
    text('校园实验室图像。', 'Campus lab image.'),
    { aspectClassName: 'aspect-[4/5]' },
  ),
];
