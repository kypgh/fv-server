import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import { PERMISSIONS } from "config/permissions";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import isCrmUser from "middleware/isCrmUser";
import crmUsersService from "services/crmUsers.service";
import tsv from "type-standard-validator";
import { mongooseIdValidator } from "utils/validation";

const router = new AdvancedRouter();
router.middleware.all(isCrmUser);

router.middleware.DELETE(
  hasCRMUserPermissions(PERMISSIONS.CRMUSERS.delete_crmuser)
);

router.DELETE(
  new AdvancedHandler({
    params: tsv.object({
      crm_user_id: tsv.string().custom(mongooseIdValidator),
    }),
  }).route(async (req, res) => {
    let result = await crmUsersService.deleteCrmUser({
      crmUser: req.params.crm_user_id,
    });
    res.status(200).json({ crmUserPermissions: result });
  })
);

router.middleware.GET(hasCRMUserPermissions(PERMISSIONS.CRMUSERS.get_crmuser));
router.GET(
  new AdvancedHandler({
    params: tsv.object({
      crm_user_id: tsv.string().custom(mongooseIdValidator),
    }),
  }).route(async (req, res) => {
    let crmUser = await crmUsersService.findByIdCrmUser(req.params.crm_user_id);

    let result = await crmUsersService.getCrmUserPermissions({
      crmUser: crmUser,
    });
    crmUser.permissions = result;
    res.status(200).json({ crmUser });
  })
);

router.middleware.PUT(
  hasCRMUserPermissions(PERMISSIONS.CRMUSERS.update_crmuser)
);
router.PUT(
  new AdvancedHandler({
    params: tsv.object({
      crm_user_id: tsv.string().custom(mongooseIdValidator),
    }),
    body: tsv.object({
      firstName: tsv.string(),
      lastName: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { firstName, lastName } = req.body;
    let crmUserId = req.params.crm_user_id;
    let crmUser = await crmUsersService.updateCrmUser({
      crmUserId,
      firstName,
      lastName,
    });
    res.status(200).json({ crmUser });
  })
);

export default router;
