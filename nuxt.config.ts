export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@nuxt/ui'],
  css: ['app/assets/css/main.css'],
  alias: {
    'app/': `${process.cwd()}/app/`,
  },
  devtools: { enabled: false },
  srcDir: '.',
  runtimeConfig: {
    dataDir: process.env.DATA_DIR || './data',
    dbPath: process.env.DB_PATH || '',
    public: {
      appName: 'Bitácora Protocolo',
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
  nitro: {
    preset: 'node-server',
  },
});
