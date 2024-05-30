import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import { PERMISSIONS } from "config/permissions";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import isCrmUser from "middleware/isCrmUser";
import tsv from "type-standard-validator";
import { mongooseIdValidator } from "utils/validation";
import reportsService from "services/postReports.service";

const router = new AdvancedRouter();
router.middleware.all(isCrmUser);
router.middleware.GET(
  hasCRMUserPermissions(PERMISSIONS.POSTSREPORTS.view_posts_reports)
);

router.GET(
  new AdvancedHandler({
    query: tsv.object({
      page: tsv.number().optional(),
      limit: tsv.number().optional(),
      postId: tsv.string().custom(mongooseIdValidator).optional(),
    }),
  }).route(async (req, res) => {
    let reports = await reportsService.getPostsReports({
      page: req.query.page,
      limit: req.query.limit,
      postId: req.query.postId,
    });

    res.status(200).json({ reports });
  })
);

export default router;
