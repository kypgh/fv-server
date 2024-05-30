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
router.middleware.PUT(
  hasCRMUserPermissions(PERMISSIONS.POSTSREPORTS.view_posts_reports)
);

router.PUT(
  new AdvancedHandler({
    params: tsv.object({
      post_report_id: tsv.string().custom(mongooseIdValidator),
    }),
    body: tsv.object({
      description: tsv.string().optional(),
      viewed: tsv.boolean().optional(),
    }),
  }).route(async (req, res) => {
    let postReport = await reportsService.updatePostReport({
      postReport: req.params.post_report_id,
      description: req.body.description,
      viewed: req.body.viewed,
    });
    res.status(200).json({ postReport });
  })
);

router.middleware.DELETE(
  hasCRMUserPermissions(PERMISSIONS.POSTSREPORTS.delete_posts_report)
);

router.DELETE(
  new AdvancedHandler({
    params: tsv.object({
      post_report_id: tsv.string().custom(mongooseIdValidator),
    }),
  }).route(async (req, res) => {
    await reportsService.deletePostReport({
      postReport: req.params.post_report_id,
    });
    res.status(200).json({ message: "Post report deleted" });
  })
);

export default router;
