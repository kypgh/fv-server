import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isCrmUser from "middleware/isCrmUser";
import crmUserService from "services/crmUsers.service";

const router = new AdvancedRouter();

router.middleware.all(isCrmUser);

router.GET(
  new AdvancedHandler({}).route(async (req, res) => {
    let user = req.user;
    let result = await crmUserService.getCrmUserPermissions({
      crmUser: user,
    });
    req.user.permissions = result;
    res.status(200).json({ user });
  })
);

export default router;
