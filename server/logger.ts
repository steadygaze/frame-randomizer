import { inspect } from "util";
import { createLogger, format, transports } from "winston";
import chalk from "chalk";
const { colorize, combine, timestamp, printf } = format;

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

export default createLogger({
  format: combine(
    colorize(),
    timestamp({
      format: process.env.FR_LOG_DATE
        ? "YYYY-MM-DD HH:mm:ss.SSS"
        : "HH:mm:ss.SSS",
    }),
    myFormat,
  ),
  transports: [new transports.Console()],
});
