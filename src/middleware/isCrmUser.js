import verify from "jsonwebtoken/verify";
import { SECRET2 } from "config/envs";
import crmUserPermissionsModel from "models/crmUserPermissions";
import crmUserRoleModel from "models/crmUserRole";
import HTTPError from "utils/HTTPError";
import mongoose from "mongoose";

const isAuthenticated = async (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(403).json({ message: "no authorization header" });
    return;
  }

  let jwt = req.headers.authorization.replace("Bearer ", "");

  try {
    let user = await verify(jwt, SECRET2);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(403).json({ message: "token expired" });
    } else {
      res.status(403).json({ message: "invalid token" });
    }
  }
};

export default isAuthenticated;
