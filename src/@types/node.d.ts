declare namespace NodeJS {
  interface ProcessEnv {
    // ENV
    NODE_ENV: string;
    APP_ID: string;
    PROJECT_ID: string;
    // LOG
    LOG_LEVEL: string;
    LOG_DATE_PATTERN: string;
    LOG_MAX_SIZE: string;
    LOG_MAX_FILES: string;
    LOG_ZIPPED_ARCHIVE: string;
    LOG_ERROR_FILES: string;

    // API
    API_URLS: string;
    JWT_SECRET: string;
    API_PORT: string;
    API_SSL_ENABLED: string;
    API_RATE_LIMIT_WINDOW_MS: string;
    API_RATE_LIMIT_MAX: string;
    // JWT
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    // REDIS
    REDIS_HOST: string;
    REDIS_PORT: string;
    REDIS_PASSWORD: string;
    // MONGO
    MONGO_URI: string;
    // GOOGLE
    GOOGLE_GEMINI_API_KEY: string;
  }
}
