import { sendJson, type ApiRequest, type ApiResponse } from "./http.js";
import { createPublicAuthSupabaseClient } from "./supabase.js";
import { websiteVisitTotalsSchema } from "../../src/lib/websiteVisitTotals.js";

export default async function handler(
  request: ApiRequest,
  response: ApiResponse,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.setHeader("Cache-Control", "no-store");
    return sendJson(response, 405, { code: "METHOD_NOT_ALLOWED" });
  }
  try {
    const { data, error } = await createPublicAuthSupabaseClient()
      .rpc("get_public_website_visit_totals")
      .abortSignal(AbortSignal.timeout(5000));
    if (error) throw error;
    const totals = websiteVisitTotalsSchema.parse(data);
    response.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    );
    // sendJson intentionally disables caching for authenticated APIs.
    return response.status(200).json(totals);
  } catch {
    response.setHeader("Cache-Control", "no-store");
    return sendJson(response, 503, {
      code: "WEBSITE_VISIT_TOTALS_UNAVAILABLE",
    });
  }
}
