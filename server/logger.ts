import { inspect } from "util";
import { createLogger, format, transports } from "winston";
import chalk from "chalk";
import DailyRotateFile from "winston-daily-rotate-file";
import { appDataPath } from "./utils";

const { colorize, combine, json, timestamp, printf } = format;

/**
 * Generates a concise representation of an object.
 * @param obj Object to format.
 * @returns String representing the object.
 */
function shortObjectFormat(obj: Object) {
  return (
    "{ " +
    Object.entries(obj)
      .map(([k, v]) => `${k}: ${inspect(v)}`)
      .join(", ") +
    " }"
  );
}

const myFormat = printf(({ level, message, timestamp, ...data }) => {
  const formattedData = shortObjectFormat(data);
  return `${chalk.gray(`[${timestamp}]`)} ${level}: ${message.replace(
    /\b\d+\b/g,
    (s: string) => chalk.yellow(s),
  )}${formattedData === "{  }" ? "" : " " + chalk.gray(formattedData)}`;
});

const console = new transports.Console({
  level: process.env.FR_CONSOLE_LOG_LEVEL || "info",
  format: combine(
    colorize(),
    timestamp({
      format: process.env.FR_LOG_DATE
        ? "YYYY-MM-DD HH:mm:ss.SSS"
        : "HH:mm:ss.SSS",
    }),
    myFormat,
  ),
});

const file = new DailyRotateFile({
  auditFile: appDataPath("log-audit-info.json"),
  level: "info",
  filename: appDataPath("pf-%DATE%.log"),
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: true,
  maxSize: "500m",
  maxFiles: "14d",
  format: json(),
});

const fileWarn = new DailyRotateFile({
  auditFile: appDataPath("log-audit-error.json"),
  level: "warn",
  filename: appDataPath("pf-warn-%DATE%.log"),
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: true,
  maxSize: "500m",
  maxFiles: "14d",
  format: json(),
});

export default createLogger({
  transports: [file, fileWarn, console],
});
