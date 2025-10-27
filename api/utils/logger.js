const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configurar formato de logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Crear instancia de logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: [
    // Logs de consola
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    // Logs de errores
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Logs generales
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Exportar funciones de logging
module.exports = {
  error: (message, meta = {}) => logger.error(message, { meta }),
  warn: (message, meta = {}) => logger.warn(message, { meta }),
  info: (message, meta = {}) => logger.info(message, { meta }),
  debug: (message, meta = {}) => logger.debug(message, { meta }),
  http: (message, meta = {}) => logger.http(message, { meta }),

  // Método para registrar errores con stack trace
  errorWithStack: (message, error) => {
    if (error && error.stack) {
      logger.error(`${message}: ${error.message}\n${error.stack}`);
    } else {
      logger.error(message);
    }
  },
};
