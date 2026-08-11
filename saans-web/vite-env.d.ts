/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_API_URL: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_DESCRIPTION: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly SSR: boolean;
    [key: string]: string | boolean;
  };
}
