// types/env.d.ts
declare global {
    namespace NodeJS {
      interface ProcessEnv {
        ASSEMBLYAI_API_KEY: string;
        NODE_ENV: 'development' | 'production' | 'test';
        WEBHOOK_URL?: string;
      }
    }
  }