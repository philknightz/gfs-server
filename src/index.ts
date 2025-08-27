import "./utils/global";
import { APIServer } from "./utils/apisvr";
import logger from "./utils/logger";
import config from "./constant/config";

let apiServer: APIServer;
let isStopping = false;

async function main() {
  logger.info("==========================================================");
  logger.info(`START [${config.projectId}/${config.appId}/${config.env}]`);
  await start().catch((e) => handleError(e));
  process.on("unhandledRejection", handleError);
  process.on("uncaughtException", handleError);
  process.on("SIGTERM", () => shutDown(1)); // kill
  process.on("SIGINT", () => shutDown(0)); // Ctrl-C
}

async function start() {
  logger.info("Start Process.");
  apiServer = new APIServer();
  await apiServer.initialize();
  await apiServer.listen();
}

const shutDown = (exitCode: number) => {
  if (isStopping) return;
  isStopping = true;
  logger.info("Received kill signal, shutting down gracefully");
  apiServer?.close().then(() => {
    logger.warn("Process exit. (%s)", exitCode);
    process.exit(exitCode);
  });
};

const handleError = (error: Error) => {
  logger.error("!!!!!!! Application Error");
  logger.error(error.message);
  logger.error(error.stack);
  setTimeout(() => shutDown(1), 2000);
};

main();
