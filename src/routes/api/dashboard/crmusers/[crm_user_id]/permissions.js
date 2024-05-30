import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import isCrmUser from "middleware/isCrmUser";
import crmUsersService from "services/crmUsers.service";
import { mongooseIdValidator, permissionValidator } from "utils/validation";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import { PERMISSIONS } from "config/permissions";

const router = new AdvancedRouter();
router.middleware.all(isCrmUser);

router.middleware.PUT(
  hasCRMUserPermissions(PERMISSIONS.RIGHTS.update_crm_user_rights)
);

router.PUT(
  new AdvancedHandler({
    params: tsv.object({
      crm_user_id: tsv.string().custom(mongooseIdValidator),
    }),
    body: tsv.object({
      permissions: tsv.array(tsv.string().custom(permissionValidator)),
    }),
  }).route(async (req, res) => {
    let { permissions } = req.body;
    let result = await crmUsersService.updatePermissions({
      crmUser: req.params.crm_user_id,
      permissions,
    });
    res.status(200).json({ crmUserPermissions: result });
  })
);

export default router;
