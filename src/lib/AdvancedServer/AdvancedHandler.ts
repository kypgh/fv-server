import { NextFunction, Request, Response, RequestHandler } from "express";
import { Validator } from "type-standard-validator";
import { OpenAPIOperation, OpenAPIPathItem } from "./OpenAPI";

class AdvancedHandler<
  VParams extends Validator<any>,
  VQuery extends Validator<any>,
  VBody extends Validator<any>
> {
  private _params?: VParams;
  private _query?: VQuery;
  private _body?: VBody;
  private _route?: RequestHandler;

  constructor(
    setup: {
      params?: VParams;
      query?: VQuery;
      body?: VBody;
    } = {}
  ) {
    if (setup.params) this._params = setup.params;
    if (setup.query) this._query = setup.query;
    if (setup.body) this._body = setup.body;
    return this;
  }

  route(
    fn: (
      req: Request<
        VParams extends Validator<infer J> ? J : Object,
        any,
        VBody extends Validator<infer L> ? L : Object,
        VQuery extends Validator<infer K> ? K : Object
      >,
      res: Response,
      next: NextFunction
    ) => Promise<any> | any
  ) {
    this._route = async (req, res, next) => {
      try {
        if (this._params) req.params = this._params?.validate(req.params);
        if (this._query) req.query = this._query?.validate(req.query);
        if (this._body) req.body = this._body?.validate(req.body);
        await fn(req as any, res, next);
      } catch (err) {
        next(err);
      }
    };
    return this;
  }

  getRoute() {
    return this._route;
  }

  _getDefinitions(): OpenAPIOperation {
    const result: OpenAPIOperation = {};
    if (this._params) {
      const paramDef: any = this._params._getDefinitions();
      result.parameters = Object.entries(paramDef.items).map(
        ([key, value]: [string, any]) => ({
          name: key,
          in: "path",
          required: true,
          schema: {
            style: value?.type,
          },
        })
      );
    }
    if (this._query) {
      const queryDef: any = this._query._getDefinitions();
      if (!result.parameters) result.parameters = [];
      result.parameters = result.parameters.concat(
        Object.entries(queryDef.items).map(([key, value]: [string, any]) => ({
          name: key,
          in: "query",
          required: true,
          schema: {
            style: value?.type,
          },
        }))
      );
    }
    if (this._body) {
      const bodyDef: any = this._body._getDefinitions();
      const body = Object.entries(bodyDef.items).reduce(
        (acc: any, [key, value]: [string, any]) => {
          acc.properties[key] = {
            type: value?.type,
          };
          if (value?.required) acc.required.push(key);
          return acc;
        },
        { style: "object", properties: {}, required: [] }
      );
      result.requestBody = {
        content: {
          "application/json": {
            schema: body,
          },
        },
        required: true,
      };
    }
    return result;
  }
}

export default AdvancedHandler;
