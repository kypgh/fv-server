import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import isCrmUser from "middleware/isCrmUser";
import crmUsersService from "services/crmUsers.service";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import { PERMISSIONS } from "config/permissions";
import bcrypt from "bcrypt";

const router = new AdvancedRouter();

router.middleware.all(isCrmUser);

router.middleware.GET(
  hasCRMUserPermissions(PERMISSIONS.CRMUSERS.view_crmusers)
);

router.GET(
  new AdvancedHandler({
    query: tsv.object({
      page: tsv.number().optional(),
      limit: tsv.number().optional(),
    }),
  }).route(async (req, res) => {
    let { page, limit } = req.query;
    let crmUsers = await crmUsersService.getAllUsers({ page, limit });
    res.status(200).json({ crmUsers });
  })
);

router.middleware.POST(
  hasCRMUserPermissions(PERMISSIONS.CRMUSERS.create_crmuser)
);

router.POST(
  new AdvancedHandler({
    body: tsv.object({
      email: tsv.string(),
      password: tsv.string(),
      confirmPassword: tsv.string(),
      firstName: tsv.string(),
      lastName: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { email, password, firstName, lastName } = req.body;
    password = await bcrypt.hash(password, 12);
    let crmUser = await crmUsersService.createCrmUser({
      email,
      password,
      firstName,
      lastName,
    });
    res.status(200).json({ message: crmUser });
  })
);

export default router;
