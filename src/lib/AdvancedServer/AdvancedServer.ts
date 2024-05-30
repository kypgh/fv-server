import express, {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler,
} from "express";
import path from "path";
import folderRouter from "./folderRouter";
import { ValidationError } from "type-standard-validator";

interface AdvancedServerSettings {
  port: number;
}

class AdvancedServer {
  private _app: Express;
  private _settings: AdvancedServerSettings;
  private _route404?: RequestHandler;
  private _routeError?: ErrorRequestHandler;
  constructor(settings: AdvancedServerSettings) {
    this._app = express();
    this._settings = settings;
    this._app.use((req, res, next) => {
      let next2 = (err: any) => {
        if (err) {
          if (err instanceof SyntaxError) {
            res.status(400).json({ error: "Invalid JSON" });
            return;
          }
          next(err);
          return;
        }
        next();
      };
      express.json({ limit: "6mb" })(req, res, next2);
    });
  }
  use = (middleware: RequestHandler) => {
    this._app.use(middleware);
    return this;
  };
  getApp = () => {
    return this._app;
  };
  folderRouter = async (folder: string = "routes") => {
    await folderRouter(this._app, path.join(require.main?.path || "", folder));
    return this;
  };
  route404 = (callback: RequestHandler) => {
    this._route404 = callback;
    return this;
  };
  routeError = (callback: ErrorRequestHandler) => {
    this._routeError = callback;
    return this;
  };
  listen = async () => {
    this._app.use(
      "*",
      this._route404
        ? this._route404
        : (req, res) => {
            res.status(404).json({
              error: "Route Not Found",
              route: `[${req.method}] ${req.path}`,
            });
          }
    );

    this._app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof ValidationError) {
          res.status(400).json(err.toJSON());
        } else {
          console.error(err);
          if (typeof this._routeError === "function") {
            this._routeError(err, req, res, next);
            return;
          }
          res.status(500).json({ message: "Internal Server Error" });
        }
      }
    );

    return new Promise((res) => {
      this._app.listen(this._settings.port, () => {
        console.info(
          `Server is running on port http://localhost:${this._settings.port}`
        );
        res(true);
      });
    });
  };
}

export default AdvancedServer;
