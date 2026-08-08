import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { communityDevelopmentApi } from "./scripts/vite-community-api";

const communityServerEnvironment = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'COMMUNITY_COLLAB_PORT',
  'COMMUNITY_COLLAB_REDIS_URL',
  'COMMUNITY_COLLAB_INSTANCE_NAME',
] as const;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '');
  communityServerEnvironment.forEach((name) => {
    if (!process.env[name] && environment[name]) process.env[name] = environment[name];
  });

  return {
    assetsInclude: ['**/*.glb'],
    server: {
      host: "::",
      port: 5173,
      hmr: {
        overlay: false,
      },
    },
    plugins: [communityDevelopmentApi(), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
