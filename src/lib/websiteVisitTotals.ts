import { z } from "zod";

export const websiteVisitTotalsSchema = z
  .object({
    recordedSince: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    totalSessions: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    totalPageViews: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  })
  .strict();

export type WebsiteVisitTotals = z.infer<typeof websiteVisitTotalsSchema>;
