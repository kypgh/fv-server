import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv, { ValidationError } from "type-standard-validator";
import isCrmUser from "middleware/isCrmUser";
import crmUserService from "services/crmUsers.service";
import crmRolesService from "services/crmRoles.service";
import { mongooseIdValidator } from "utils/validation";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import { PERMISSIONS } from "config/permissions";

const router = new AdvancedRouter();

router.middleware.all(isCrmUser);
router.middleware.PUT(
  hasCRMUserPermissions(PERMISSIONS.ROLES.update_role_permissions)
);

router.PUT(
  new AdvancedHandler({
    params: tsv.object({
      crmroleId: tsv.string().custom(mongooseIdValidator),
    }),
    body: tsv.object({
      permissions: tsv.array(tsv.string()),
    }),
  }).route(async (req, res) => {
    let { permissions } = req.body;
    let result = await crmUserService.updateCrmRolePermissions({
      role: req.params.crmroleId,
      permissions,
    });
    res.status(200).json({ message: result });
  })
);

router.middleware.DELETE(hasCRMUserPermissions(PERMISSIONS.ROLES.delete_role));

router.DELETE(
  new AdvancedHandler({
    params: tsv.object({
      crmroleId: tsv.string().custom(mongooseIdValidator),
    }),
  }).route(async (req, res) => {
    let result = await crmUserService.deleteCrmRole({
      role: req.params.crmroleId,
    });
    res.status(200).json({ message: result });
  })
);

router.middleware.GET(hasCRMUserPermissions(PERMISSIONS.ROLES.get_role));

router.GET(
  new AdvancedHandler({
    params: tsv.object({
      crmroleId: tsv.string().custom(mongooseIdValidator),
    }),
  }).route(async (req, res) => {
    let role = await crmRolesService.getRoleById({
      roleId: req.params.crmroleId,
    });
    res.status(200).json({ role });
  })
);

export default router;
