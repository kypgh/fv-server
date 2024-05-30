import crmUserModel from "../models/crmUser.js";
import crmUserPermissionsModel from "models/crmUserPermissions.js";
import crmUserRoleModel from "models/crmUserRole.js";
import HTTPError from "utils/HTTPError.js";
import mongoose from "mongoose";

const crmUserService = {
  createCrmUser: async ({ email, password, firstName, lastName }) => {
    let user = await crmUserModel.findOne({
      email,
    });

    if (user) {
      throw new HTTPError("A user with this email already exists", 400);
    }

    let crmUser = await crmUserModel.create({
      email,
      password,
      firstName,
      lastName,
    });
    let userRoleDefault = await crmUserRoleModel.findOne({ name: "default" });
    let userPermissions = await crmUserPermissionsModel.create({
      crmUser,
      role: userRoleDefault,
    });

    await crmUser.save();
    await userPermissions.save();
    return crmUser;
  },
  findCrmUser: async (email) => {
    return crmUserModel.findOne({ email });
  },
  findByIdCrmUser: async (id) => {
    //return crmUserModel.findById(id);
    let crmUser = await crmUserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "crmuserpermissions",
          localField: "_id",
          foreignField: "crmUser",
          as: "permissions",
          pipeline: [
            {
              $lookup: {
                from: "crmuserroles",
                localField: "role",
                foreignField: "_id",
                as: "role",
              },
            },
          ],
        },
      },
    ]);
    let result = crmUser[0];
    result.role = result.permissions[0].role[0].name;
    result.permissions = result.permissions[0].permissions;
    return result;
  },
  updatePermissions: async ({ crmUser, permissions }) => {
    return crmUserPermissionsModel.findOneAndUpdate(
      { crmUser },
      { permissions },
      { returnDocument: "after" }
    );
  },
  deleteCrmUser: async ({ crmUser }) => {
    return await crmUserPermissionsModel.findOneAndUpdate(
      { crmUser },
      { isSuspened: true },
      { returnDocument: "after" }
    );
  },
  updateRole: async ({ crmUser, role }) => {
    return crmUserPermissionsModel.findOneAndUpdate(
      { crmUser },
      { role },
      { returnDocument: "after" }
    );
  },
  createCrmRole: async ({ role }) => {
    let crmUserRole = await crmUserRoleModel({
      name: role,
    });
    await crmUserRole.save();
    return crmUserRole;
  },
  updateCrmRolePermissions: async ({ role, permissions }) => {
    let updatedRole = await crmUserRoleModel.findOneAndUpdate(
      { _id: role },
      { permissions: permissions },
      { returnDocument: "after" }
    );

    if (!updatedRole) {
      throw new HTTPError("Role not found", 404);
    }

    return updatedRole;
  },
  deleteCrmRole: async ({ role }) => {
    let roleToBeDeleted = await crmUserRoleModel.findById(role);
    if (roleToBeDeleted.name === "default" || roleToBeDeleted === "Admin") {
      return "Cannot delete this  role";
    }

    let usersWithRole = await crmUserPermissionsModel.find({ role: role });
    let defaultRole = await crmUserRoleModel.findOne({ name: "default" });
    usersWithRole.map(async (user) => {
      await crmUserPermissionsModel.findOneAndUpdate(
        { crmUser: user.crmUser },
        { role: defaultRole },
        { returnDocument: "after" }
      );
    });

    await crmUserRoleModel.findOneAndDelete({ _id: role });
    return "Role deleted";
  },
  getAllUsers: async ({ page, limit }) => {
    let aggregate = crmUserModel.aggregate([
      {
        $lookup: {
          from: "crmuserpermissions",
          localField: "_id",
          foreignField: "crmUser",
          as: "permissions",
          pipeline: [
            {
              $lookup: {
                from: "crmuserroles",
                localField: "role",
                foreignField: "_id",
                as: "role",
              },
            },
            {
              $match: {
                isSuspened: false,
              },
            },
            {
              $unwind: "$role",
            },
            {
              $project: {
                permissions: 1,
                role: "$role.name",
              },
            },
          ],
        },
      },
      {
        $unwind: "$permissions",
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          permissions: "$permissions.permissions",
          role: "$permissions.role",
        },
      },
    ]);

    let users = await crmUserModel.aggregatePaginate(aggregate, {
      page,
      limit,
    });
    return users;
  },
  updateCrmUser: async ({ crmUserId, firstName, lastName }) => {
    return crmUserModel.findOneAndUpdate(
      { _id: crmUserId },
      { firstName, lastName },
      { returnDocument: "after" }
    );
  },
  getCrmUserPermissions: async ({ crmUser }) => {
    return crmUserPermissionsModel
      .findOne({
        crmUser,
      })
      .populate("role");
  },
};

export default crmUserService;
