/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMAP_KEY?: string;
  readonly VITE_AMAP_SECURITY_CODE?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_COMMUNITY_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.glb' {
  const src: string;
  export default src;
}

declare namespace JSX {
  interface IntrinsicElements {
    meshLineGeometry: Record<string, unknown>;
    meshLineMaterial: Record<string, unknown>;
  }
}
