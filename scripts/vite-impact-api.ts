import type { Connect, Plugin } from "vite";
import handler from "../api/_lib/website-visit-totals.js";
import type { ApiRequest } from "../api/_lib/http.js";
import { apiResponse } from "./vite-community-api";

/** Local previews can read public totals; test visits never enter production analytics. */
export function impactPublicApi(): Plugin {
  function attach(middlewares: Connect.Server) {
    middlewares.use(async (request, response, next) => {
      const pathname = new URL(request.url || "/", "http://impact.local")
        .pathname;
      if (pathname === "/api/analytics/collect") {
        apiResponse(response).status(202).json({ ok: true, ignored: true });
        return;
      }
      if (pathname !== "/api/impact/visits") return next();
      await handler(request as ApiRequest, apiResponse(response));
    });
  }
  return {
    name: "rgan-impact-public-api",
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
  };
}
