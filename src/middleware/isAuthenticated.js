import verify from "jsonwebtoken/verify";
import { SECRET } from "config/envs";

const isAuthenticated = async (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(403).json({ message: "no authorization header" });
    return;
  }

  let jwt = req.headers.authorization.replace("Bearer ", "");

  try {
    let user = await verify(jwt, SECRET);
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
