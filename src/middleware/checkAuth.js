import verify from "jsonwebtoken/verify";
import { SECRET } from "config/envs";

const checkAuth = async (req, res, next) => {
  if (!req.headers.authorization) {
    next();
  }

  let jwt = req.headers.authorization.replace("Bearer ", "");

  try {
    let user = await verify(jwt, SECRET);
    req.user = user;

    next();
  } catch (error) {
    next();
  }
};

export default checkAuth;
