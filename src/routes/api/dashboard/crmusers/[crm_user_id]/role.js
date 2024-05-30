import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import isCrmUser from "middleware/isCrmUser";
import crmUsersService from "services/crmUsers.service";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import { PERMISSIONS } from "config/permissions";
import { mongooseIdValidator } from "utils/validation";

const router = new AdvancedRouter();
router.middleware.all(isCrmUser);

router.middleware.PUT(
  hasCRMUserPermissions(PERMISSIONS.ROLES.update_crm_user_role)
);

router.PUT(
  new AdvancedHandler({
    params: tsv.object({
      crm_user_id: tsv.string().custom(mongooseIdValidator),
    }),
    body: tsv.object({
      role: tsv.string().custom(mongooseIdValidator),
    }),
  }).route(async (req, res) => {
    let result = await crmUsersService.updateRole({
      crmUser: req.params.crm_user_id,
      role: req.body.role,
    });
    res.status(200).json({ crmUserPermissions: result });
  })
);

export default router;
