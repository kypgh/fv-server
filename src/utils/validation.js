import mongoose from "mongoose";
import { ValidationError } from "type-standard-validator";
import { PERMISSIONS } from "config/permissions";
import HTTPError from "./HTTPError";

export const mongooseIdValidator = (value) => {
  try {
    let id = new mongoose.Types.ObjectId(value);
    if (id.toString() === value) {
      return value;
    } else {
      throw new ValidationError("Invalid id", "");
    }
  } catch (error) {
    throw new ValidationError("Invalid id", "");
  }
};

const PERMISSIONS_ARRAY = Object.values(PERMISSIONS)
  .map((permission) => Object.values(permission))
  .flat();
export const permissionValidator = (value) => {
  if (PERMISSIONS_ARRAY.includes(value)) {
    return value;
  } else {
    throw new HTTPError("Invalid permission", 404);
  }
};
