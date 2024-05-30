import express, { Handler, Router, Express } from "express";
import AdvancedHandler from "./AdvancedHandler";
import { OpenAPIPathItem, OpenAPIPaths } from "./OpenAPI";

type HTTPMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head"
  | "all";

const catchMiddleware =
  (fn: Handler): Handler =>
  async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };

class AdvancedRouter {
  private _router: Router;
  private _routes: {
    get?: AdvancedHandler<any, any, any>;
    post?: AdvancedHandler<any, any, any>;
    put?: AdvancedHandler<any, any, any>;
    patch?: AdvancedHandler<any, any, any>;
    delete?: AdvancedHandler<any, any, any>;
    middleware: {
      all?: Handler[];
      get?: Handler[];
      post?: Handler[];
      put?: Handler[];
      patch?: Handler[];
      delete?: Handler[];
    };
  } = { middleware: {} };
  private _isSetup = false;
  private _keepDefinitions: boolean;
  private _definitions: {
    get?: AdvancedHandler<any, any, any>;
    post?: AdvancedHandler<any, any, any>;
    put?: AdvancedHandler<any, any, any>;
    patch?: AdvancedHandler<any, any, any>;
    delete?: AdvancedHandler<any, any, any>;
  } = {};
  constructor() {
    this._router = express.Router({ mergeParams: true });
    this._keepDefinitions = !!process.env.ADVANCED_KEEP_ROUTE_DEFINITIONS;
  }
  GET(handler: AdvancedHandler<any, any, any>) {
    if (this._isSetup) throw new Error("Router already setup");
    if (this._routes.get) throw new Error("GET already defined");
    if (this._keepDefinitions) this._definitions.get = handler;
    this._routes.get = handler;
    return this;
  }
  POST(handler: AdvancedHandler<any, any, any>) {
    if (this._isSetup) throw new Error("Router already setup");
    if (this._routes.post) throw new Error("POST already defined");
    if (this._keepDefinitions) this._definitions.post = handler;
    this._routes.post = handler;
    return this;
  }
  PUT(handler: AdvancedHandler<any, any, any>) {
    if (this._isSetup) throw new Error("Router already setup");
    if (this._routes.put) throw new Error("PUT already defined");
    if (this._keepDefinitions) this._definitions.put = handler;
    this._routes.put = handler;
    return this;
  }
  PATCH(handler: AdvancedHandler<any, any, any>) {
    if (this._isSetup) throw new Error("Router already setup");
    if (this._routes.patch) throw new Error("PATCH already defined");
    if (this._keepDefinitions) this._definitions.patch = handler;
    this._routes.patch = handler;
    return this;
  }
  DELETE(handler: AdvancedHandler<any, any, any>) {
    if (this._isSetup) throw new Error("Router already setup");
    if (this._routes.delete) throw new Error("DELETE already defined");
    if (this._keepDefinitions) this._definitions.delete = handler;
    this._routes.delete = handler;
    return this;
  }

  middleware = {
    all: (handler: Handler | Handler[]) => {
      this._routes.middleware.all = Array.isArray(handler)
        ? handler
        : [handler];
    },
    GET: (handler: Handler | Handler[]) => {
      this._routes.middleware.get = Array.isArray(handler)
        ? handler
        : [handler];
    },
    POST: (handler: Handler | Handler[]) => {
      this._routes.middleware.post = Array.isArray(handler)
        ? handler
        : [handler];
    },
    PUT: (handler: Handler | Handler[]) => {
      this._routes.middleware.put = Array.isArray(handler)
        ? handler
        : [handler];
    },
    PATCH: (handler: Handler | Handler[]) => {
      this._routes.middleware.patch = Array.isArray(handler)
        ? handler
        : [handler];
    },
    DELETE: (handler: Handler | Handler[]) => {
      this._routes.middleware.delete = Array.isArray(handler)
        ? handler
        : [handler];
    },
  };

  _getRouter() {
    if (this._isSetup) throw new Error("Router already setup");
    if (this._routes.middleware.all) {
      this._router.all("", this._routes.middleware.all.map(catchMiddleware));
    }
    if (this._routes.get) {
      let middleware: Handler[] = [];
      if (this._routes.middleware.get) {
        middleware = middleware.concat(this._routes.middleware.get);
      }
      middleware = middleware.map(catchMiddleware);
      this._router.get("", middleware, this._routes.get.getRoute() as Handler);
    }
    if (this._routes.post) {
      let middleware: Handler[] = [];
      if (this._routes.middleware.post) {
        middleware = middleware.concat(this._routes.middleware.post);
      }
      middleware = middleware.map(catchMiddleware);
      this._router.post(
        "",
        middleware,
        this._routes.post.getRoute() as Handler
      );
    }
    if (this._routes.put) {
      let middleware: Handler[] = [];
      if (this._routes.middleware.put) {
        middleware = middleware.concat(this._routes.middleware.put);
      }
      middleware = middleware.map(catchMiddleware);
      this._router.put("", middleware, this._routes.put.getRoute() as Handler);
    }
    if (this._routes.patch) {
      let middleware: Handler[] = [];
      if (this._routes.middleware.patch) {
        middleware = middleware.concat(this._routes.middleware.patch);
      }
      this._router.patch(
        "",
        middleware,
        this._routes.patch.getRoute() as Handler
      );
    }
    if (this._routes.delete) {
      let middleware: Handler[] = [];
      if (this._routes.middleware.delete) {
        middleware = middleware.concat(this._routes.middleware.delete);
      }
      middleware = middleware.map(catchMiddleware);
      this._router.delete(
        "",
        middleware,
        this._routes.delete.getRoute() as Handler
      );
    }
    this._isSetup = true;
    return this._router;
  }

  _getDefinitions(): OpenAPIPathItem {
    let result: OpenAPIPathItem = {
      description: "",
      summary: "",
    };
    if (this._definitions.get) {
      result.get = this._definitions.get._getDefinitions();
    }
    if (this._definitions.post) {
      result.post = this._definitions.post._getDefinitions();
    }
    if (this._definitions.put) {
      result.put = this._definitions.put._getDefinitions();
    }
    if (this._definitions.patch) {
      result.patch = this._definitions.patch._getDefinitions();
    }
    if (this._definitions.delete) {
      result.delete = this._definitions.delete._getDefinitions();
    }
    return result;
  }
}

export default AdvancedRouter;
