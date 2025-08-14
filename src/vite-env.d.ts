/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SHEETS_API_KEY: string
  readonly VITE_SPREADSHEET_ID: string
  readonly VITE_SERVICE_ACCOUNT_EMAIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
