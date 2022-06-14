declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      REDIS_URL: string;
      PORT: string;
      SESSION_SECRET: string;
      CORS_ORIGIN: string;
      COOKIE_NAME: string;
      FORGOT_PASSWORD_PREFIX: string;
      GABE_UID: string;
    }
  }
}

export {}
