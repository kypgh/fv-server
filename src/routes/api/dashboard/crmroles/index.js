import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import isCrmUser from "middleware/isCrmUser";
import crmUserService from "services/crmUsers.service";
import crmRolesService from "services/crmRoles.service";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import { PERMISSIONS } from "config/permissions";

const router = new AdvancedRouter();

router.middleware.all(isCrmUser);

router.middleware.POST(hasCRMUserPermissions(PERMISSIONS.ROLES.create_role));

router.POST(
  new AdvancedHandler({
    body: tsv.object({
      role: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { role } = req.body;
    let result = await crmUserService.createCrmRole({
      role,
    });
    res.status(200).json({ message: result });
  })
);

router.middleware.GET(hasCRMUserPermissions(PERMISSIONS.ROLES.view_roles));

router.GET(
  new AdvancedHandler().route(async (req, res) => {
    let roles = await crmRolesService.getAllCrmRoles();
    res.status(200).json({ roles });
  })
);

export default router;
