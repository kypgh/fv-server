import crmUserPermissionsModel from "models/crmUserPermissions";
import mongoose from "mongoose";

const hasCRMUserPermissions = (permission) => async (req, res, next) => {
  if (!req.user) {
    throw new Error("req.user is not set - use after auth middleware");
  }
  let userPermissionsDocument = await crmUserPermissionsModel
    .findOne({
      crmUser: new mongoose.Types.ObjectId(req.user._id),
    })
    .populate("role");

  req.userPermissions = userPermissionsDocument.toJSON();
  if (req.userPermissions?.role?.name === "Admin") {
    next();
    return;
  }

  let permissions = [
    ...req.userPermissions.permissions,
    ...req.userPermissions.role.permissions,
  ];
  if (permissions.includes(permission)) {
    next();
  } else {
    res.status(403).json({ message: "no permission" });
  }
};

export default hasCRMUserPermissions;
