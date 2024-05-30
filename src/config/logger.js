import expressWinston from "express-winston";
import winston from "winston";
import chalk from "chalk";

// Create a Winston logger - passing in the Logtail transport
export const loggerConsole = expressWinston.logger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        // Add the message timestamp with the preferred format
        winston.format.timestamp({ format: "HH:mm:ss" }),
        // Tell Winston that the logs must be colored
        // Define the format of the message showing the timestamp, the level and the message
        winston.format.printf((info) => {
          let statusCode = info.meta?.res?.statusCode;
          if (statusCode >= 500) {
            statusCode = chalk.red(statusCode);
          } else if (statusCode >= 400) {
            statusCode = chalk.yellow(statusCode);
          } else if (statusCode >= 300) {
            statusCode = chalk.blue(statusCode);
          } else if (statusCode >= 200) {
            statusCode = chalk.green(statusCode);
          }
          return `${info.timestamp} [${statusCode}]: ${info.message}`;
        })
      ),
    }),
  ],
});
