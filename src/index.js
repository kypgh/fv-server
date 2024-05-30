import cors from "cors";
import { PORT } from "./config/envs";
import AdvancedServer from "@lib/AdvancedServer/AdvancedServer";
import mongooseService from "services/mongoose.service";
import HTTPError from "utils/HTTPError";
import multer from "multer";
import { loggerConsole } from "config/logger";
import statusPageService from "services/statusPage.service";

async function main() {
  await mongooseService.connect();
  const server = new AdvancedServer({
    port: PORT,
  });
  server.use(cors());
  server.use(loggerConsole);
  await server.folderRouter();

  server.routeError((err, req, res) => {
    if (err instanceof HTTPError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }

    //check if error mesage is instance of multer error
    if (err instanceof multer.MulterError) {
      res.status(400).json({ message: `multer error, ${err.message}` });
      return;
    }

    if (err instanceof URIError) {
      return res.status(400).json({ message: "Invalid URI" });
    }

    statusPageService.createEndpointIncident({
      method: req.method,
      path: req.path,
      message: err.message || "Internal server error",
    });

    res.status(500).json({ message: "Internal Server Error" });
  });
  server.listen();
}

main();
