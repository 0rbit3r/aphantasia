/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_URL: string

    readonly VITE_API_PATH: string
    readonly VITE_HUB_PATH: string

    readonly VITE_LANGUAGE: string
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }