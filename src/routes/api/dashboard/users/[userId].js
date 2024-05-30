import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import usersService from "services/users.service";
import isCrmUser from "middleware/isCrmUser";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import { PERMISSIONS } from "config/permissions";

const router = new AdvancedRouter();
router.middleware.all(isCrmUser);
router.middleware.GET(hasCRMUserPermissions(PERMISSIONS.USERS.get_user));

router.GET(
  new AdvancedHandler({
    params: tsv.object({
      userId: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { userId } = req.params;
    let user = await usersService.getUserById({ userId });
    res.status(200).json({ user });
  })
);

export default router;
