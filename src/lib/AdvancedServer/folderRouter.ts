import fs from "fs";
import path from "path";
import { Express } from "express";
import AdvancedRouter from "./AdvancedRouter";

const calcRoutePath = (
  _path: string,
  file: string,
  prefix: string,
  _originalPath: string
): string => {
  let _fileName =
    file === "index.ts" || file === "index.js"
      ? ""
      : file.substring(0, file.length - 3);
  return path
    .join("/", prefix, _path.replace(_originalPath, ""), _fileName)
    .replace(/\\/g, "/")
    .replace(/\[/g, ":")
    .replace(/\]/g, "");
};

async function _folderRouter(
  server: Express,
  _path: string,
  _originalPath: string,
  _prefix: string,
  verbose: boolean = false
): Promise<void> {
  const files = fs.readdirSync(path.resolve(_path), { withFileTypes: true });
  const sortedFiles = files.sort((a, b) => (a.name[0] === "[" ? 1 : -1));
  for (const file of sortedFiles) {
    if (file.isDirectory()) {
      await _folderRouter(
        server,
        path.join(_path, file.name),
        _originalPath,
        _prefix,
        verbose
      );
    } else if (file.name.endsWith(".ts") || file.name.endsWith(".js")) {
      if (file.name.endsWith(".ts"))
        file.name = file.name.replace(".ts", ".js");
      const { default: router }: { default: AdvancedRouter } = await import(
        path.resolve(_path, file.name)
      );
      const routePath: string = calcRoutePath(
        _path,
        file.name,
        _prefix,
        _originalPath
      );
      console.log(`[PATH] ${routePath}`);
      server.use(routePath, router._getRouter());
    }
  }
}

const folderRouter = async (
  server: Express,
  _path: string,
  _prefix: string = ""
): Promise<void> => {
  return _folderRouter(
    server,
    path.join(_path, ""),
    path.join(_path, ""),
    _prefix,
    process.env.ENV === "development"
  );
};

export default folderRouter;
