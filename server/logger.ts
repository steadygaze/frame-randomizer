import { createLogger, format, transports } from "winston";
import chalk from "chalk";
const { colorize, combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${chalk.gray(`[${timestamp}]`)} ${level}: ${message}`;
});

export default createLogger({
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS A" }),
    myFormat,
  ),
  transports: [new transports.Console()],
});
