// utils/logger.js
// Simple production-ready logger utility

const LOG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
};

const getTimestamp = () => new Date().toISOString();

const formatMessage = (level, message, meta = null) => {
  const base = `[${getTimestamp()}] [${level}] ${message}`;
  return meta ? `${base} | ${JSON.stringify(meta)}` : base;
};

const logger = {
  info: (message, meta) => {
    console.log(formatMessage(LOG_LEVELS.INFO, message, meta));
  },

  warn: (message, meta) => {
    console.warn(formatMessage(LOG_LEVELS.WARN, message, meta));
  },

  error: (message, meta) => {
    console.error(formatMessage(LOG_LEVELS.ERROR, message, meta));
  },

  debug: (message, meta) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  },
};

export default logger;
