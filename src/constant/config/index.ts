import dotenv from "dotenv";

if (dotenv.config({ path: `.env` }).error) throw new Error(`Environment file not found (.env)`);

// set default value
if (!process.env.TZ) process.env.TZ = "UTC";
if (!process.env.LOG_LEVEL) process.env.LOG_LEVEL = "debug";

const config = {
  env: process.env.NODE_ENV,
  appId: process.env.APP_ID,
  projectId: process.env.PROJECT_ID,
  tz: process.env.TZ,
  log: {
    // default: info
    level: process.env.LOG_LEVEL,
    // default: YYYY-MM-DD
    datePattern: process.env.LOG_DATE_PATTERN,
    // default: null
    maxSize: process.env.LOG_MAX_SIZE,
    // default: null
    maxFiles: process.env.LOG_MAX_FILES,
    // default: false
    zippedArchive: process.env.LOG_ZIPPED_ARCHIVE?.booleanify(),
    // default: false
    errorFiles: process.env.LOG_ERROR_FILES?.booleanify(),
  },
  api: {
    port: parseInt(process.env.API_PORT),
    urls: process.env.API_URLS.split(","),
    sslCertsPath: "./certs" as const,
    rateLimitWindowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS),
    rateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX),
  },
  jwt: {
    secretKey: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    cache_showcaseKey: "cache_showcaseKey",
  },
  mongo: {
    uri: process.env.MONGO_URI,
  },
  google: {
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  },
};

export default config;
