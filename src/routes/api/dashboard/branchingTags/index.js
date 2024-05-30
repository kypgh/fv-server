import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import branchingTagsService from "services/branchingTags.service";
import isCrmUser from "middleware/isCrmUser";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import { PERMISSIONS } from "config/permissions";

const router = new AdvancedRouter();

router.middleware.all(isCrmUser);

router.middleware.GET(
  hasCRMUserPermissions(PERMISSIONS.BRANCHINGTAGS.view_branchingtags)
);

router.GET(
  new AdvancedHandler({}).route(async (req, res) => {
    let branchingTags = await branchingTagsService.getAllBranchingTags();
    res.status(200).json({ branchingTags });
  })
);

export default router;
