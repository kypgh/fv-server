import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import usersService from "services/users.service";
import isCrmUser from "middleware/isCrmUser";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import { PERMISSIONS } from "config/permissions";

const router = new AdvancedRouter();
router.middleware.all(isCrmUser);
router.middleware.GET(hasCRMUserPermissions(PERMISSIONS.USERS.view_users));

router.GET(
  new AdvancedHandler({
    query: tsv.object({
      page: tsv.number().optional(),
      limit: tsv.number().optional(),
      sort: tsv.string().optional(),
    }),
  }).route(async (req, res) => {
    let { page, limit, sort } = req.query;
    let users = await usersService.getAllUsers({
      page: page ?? 1,
      limit: limit ?? 10,
      sort: sort ?? null,
    });
    res.status(200).json({ users });
  })
);

export default router;
