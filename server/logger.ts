import { createLogger, format, transports } from "winston";
const { colorize, combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

export default createLogger({
  format: combine(colorize(), timestamp(), myFormat),
  transports: [new transports.Console()],
});
