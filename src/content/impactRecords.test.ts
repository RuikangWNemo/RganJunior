import { describe, expect, it } from "vitest";
import invitationZh from "./voices/summer-co-creation-camp-invitation.html?raw";
import invitationEn from "./voices/summer-co-creation-camp-invitation.en.html?raw";
import tianshiZh from "./voices/technology-ecology-stars.html?raw";
import tianshiEn from "./voices/technology-ecology-stars.en.html?raw";
import catalog from "./article-imports/catalog.json";
import {
  campParticipation,
  familyVoices,
  featuredGrowthStory,
} from "./impactRecords";

function articleText(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.textContent!.replace(/\s+/g, " ").trim();
}

describe("Impact source integrity", () => {
  it.each(["zh", "en"] as const)(
    "preserves the featured quotation verbatim in %s",
    (lang) => {
      const source = articleText(lang === "zh" ? tianshiZh : tianshiEn);
      expect(source).toContain(featuredGrowthStory.quote[lang]);
    },
  );

  it.each(["zh", "en"] as const)(
    "preserves each parent’s source quotation verbatim in %s",
    (lang) => {
      const source = articleText(lang === "zh" ? invitationZh : invitationEn);
      for (const voice of familyVoices)
        expect(source).toContain(voice.quote[lang]);
    },
  );

  it("draws camp participation figures from the linked first-person camp report", () => {
    const report = catalog.find(
      (article) =>
        `/community-stories/${article.slug}` === campParticipation.sourceHref,
    );
    expect(report).toBeDefined();
    const numbers = report!.content.match(
      /(\d+) 个家庭、(\d+) 个孩子，从中美两地 (\d+) 座城市/,
    );
    expect(numbers).not.toBeNull();
    const [youth, families, cities] = campParticipation.metrics;
    expect([families.value, youth.value, cities.value]).toEqual(
      numbers!.slice(1),
    );
  });
});
