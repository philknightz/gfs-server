import cors from "cors";
import http from "http";
import https from "https";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import RateLimit from "express-rate-limit";
import { Duplex } from "stream";
import { HttpError } from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import authRoute from "../routes/auth.route";
import googleRoute from "../routes/google.route";
import { raiseError } from "./response";
import { Code } from "./error";
import logger from "./logger";
import session from "express-session";
import RedisStore from "connect-redis";
import { client as redisClient } from "../libs/redis";
import "../libs/db";
import config from "../constant/config";
import path from "path";
import moment from "moment-timezone";

export class APIServer {
  readonly app = express();
  readonly protocol: string;
  readonly server: http.Server | https.Server;
  readonly connections: Duplex[] = [];

  constructor() {
    this.server = http.createServer(this.app);
    this.protocol = "HTTP";
  }

  async initialize(): Promise<void> {
    this.app.set("trust proxy", 1);
    this.app.set("etag", false);

    // adding Helmet to enhance your Rest API's security
    this.app.use(helmet());

    // only parses json
    this.app.use(express.json());

    // only parses urlencoded bodies
    this.app.use(express.urlencoded({ extended: true }));

    // enabling CORS for all requests
    this.app.use(cors());

    this.app.use(express.static("public"));
    this.app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

    // Ensure Redis client is connected before using it for session store
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const RedisStoreInstance = new RedisStore({ client: redisClient });

    // Initialize session middleware with RedisStore
    this.app.use(
      session({
        store: RedisStoreInstance,
        secret: "secret",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: config.env === "" },
      })
    );

    // adding morgan to log HTTP requests
    this.app.use(
      morgan(config.env !== "development" ? "combined" : "dev", {
        skip: (_req, res) => config.env !== "development" && res.statusCode < 400,
        stream: { write: (message: string) => logger.http(message.trimEnd()) },
      })
    );

    // attempt to compress response bodies for all requests
    this.app.use(compression());

    // IP rate-limiting middleware for Express
    this.app.use(
      RateLimit({
        windowMs: config.api.rateLimitWindowMs,
        max: config.api.rateLimitMax,
      })
    );

    // Add request logging middleware
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      let message = `${moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")}: [${req.method} - ${req.path}]`;
      if (Object.keys(req.query).length > 0) {
        message += `\n - Query: ${JSON.stringify(req.query)}`;
      }
      if (Object.keys(req.body).length > 0) {
        message += `\n - Body: ${JSON.stringify(req.body)}`;
      }
      logger.info(message);
      next();
    });

    // Initializing middlewares
    this.app.use(express.static("public"));
    // Initializing router handlers
    this.app.get("/", (_req, res) => res.sendStatus(200));
    this.app.use("/auth", authRoute());
    this.app.use("/google", googleRoute());

    // catch 404 and forward to error handler
    this.app.use((_req: Request, res: Response) => res.sendStatus(404));

    // error handler
    this.app.use((err: HttpError, req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        res.locals.error = req.app.get("env") === "development" ? err : {};
        res.locals.message = err.message;
        if (!err.status) err.status = 500;
        if (!err.code) err.code = Code.UNKNOWN_ERROR;
        raiseError(res, err.status, err.code, err.message);
      } catch (err) {
        next(err);
      }
    });
  }

  async listen(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(config.api.port, "0.0.0.0", () => {
        const addr = this.server.address();
        const bind = typeof addr === "string" ? "pipe " + addr : addr ? "port " + addr.port : "";
        logger.info("%s Server listen on %s.", this.protocol, bind);
        resolve();
      });

      this.server.on("connection", (connection) => {
        this.connections.push(connection);
        connection.on("close", () => {
          let index = 0;
          while (index < this.connections.length) {
            if (this.connections[index] !== connection) {
              index++;
              continue;
            }
            delete this.connections[index];
          }
        });
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      const addr = this.server.address();
      const bind = typeof addr === "string" ? "pipe " + addr : addr ? "port " + addr.port : "";
      this.server.close(() => {
        logger.info("%s Server closed on %s.", this.protocol, bind);
        resolve();
      });
      this.connections.forEach((conn) => conn.end());
      setTimeout(() => this.connections.forEach((conn) => conn.destroy()), 5000);
    });
  }
}
