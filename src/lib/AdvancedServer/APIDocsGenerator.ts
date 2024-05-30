import path from "path";
import fs from "fs";
import _ from "lodash";

import { OpenAPI, OpenAPIPaths } from "./OpenAPI";
import AdvancedRouter from "./AdvancedRouter";
import { stringify } from "yaml";

const calcRoutePath = (
  routePath: string,
  file: string,
  prefix: string,
  originalPath: string
): string => {
  let fileName =
    file === "index.ts" || file === "index.js"
      ? ""
      : file.substring(0, file.length - 3);
  return path
    .join("/", prefix, routePath.replace(originalPath, ""), fileName)
    .replace(/\\/g, "/")
    .replace(/\[/g, "{")
    .replace(/\]/g, "}");
};

async function parseRoutes(
  currentPath: string,
  originalPath: string,
  prefix: string,
): Promise<{
  paths: OpenAPIPaths
}> {
  const files = fs.readdirSync(path.resolve(currentPath), { withFileTypes: true });
  const sortedFiles = files.sort((a, b) => (a.name[0] === "[" ? 1 : -1));
  let result: OpenAPIPaths = {};
  for (const file of sortedFiles) {
    if (file.isDirectory()) {
      const res = await parseRoutes(
        path.join(currentPath, file.name),
        originalPath,
        prefix,
      );
      result = {
        ...result,
        ...res.paths
      };
    } else if (file.name.endsWith(".ts") || file.name.endsWith(".js")) {
      if (file.name.endsWith(".ts"))
        file.name = file.name.replace(".ts", ".js");
      const { default: router }: { default: AdvancedRouter } = await import(
        path.resolve(currentPath, file.name)
      );
      const routePath: string = calcRoutePath(
        currentPath,
        file.name,
        prefix,
        originalPath
      );
      result[routePath] = router._getDefinitions();
      console.log(`Loaded ${routePath}`);
    }
  }
  return {
    paths: result
  };
}

async function generate(extraSettings: Omit<OpenAPI, "openapi">) {
  let routesPath = path.join(require.main?.path || "", "../routes");
  let generated: OpenAPI = {
    openapi: "3.1.0",
    info: {
      title: "API - auto generated",
      description: "API - auto generated",
      version: "1.0.0",
    },
    ...(await parseRoutes(routesPath, routesPath, ""))
  };
  let result: OpenAPI = _.merge(generated, extraSettings)
  return result;
}


generate({
  info: {
    title: "API - TEST",
    description: "testing generation of docs",
    version: "1.0.0",
  },
}).then(res => {
  fs.writeFileSync("opeapi.json", JSON.stringify(res, null, 2));
  fs.writeFileSync("openapi.yaml", stringify(res, null, 2));
})