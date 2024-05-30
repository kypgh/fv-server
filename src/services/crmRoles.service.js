import crmUserRoleModel from "models/crmUserRole.js";

const crmRolesService = {
  getAllCrmRoles: async () => {
    return crmUserRoleModel.find();
  },
  getRoleById: async ({ roleId }) => {
    return crmUserRoleModel.findById(roleId);
  },
};

export default crmRolesService;
