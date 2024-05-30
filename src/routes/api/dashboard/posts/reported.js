import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isCrmUser from "middleware/isCrmUser";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import { PERMISSIONS } from "config/permissions";
import postsService from "services/post.service";
import tsv from "type-standard-validator";

const router = new AdvancedRouter();

router.middleware.all(isCrmUser);

router.middleware.GET(
  hasCRMUserPermissions(PERMISSIONS.POSTS.view_reported_posts)
);

router.GET(
  new AdvancedHandler({
    query: tsv.object({
      page: tsv.number().optional(),
      limit: tsv.number().optional(),
    }),
  }).route(async (req, res) => {
    let posts = await postsService.getReportedPosts(
      req.query.page,
      req.query.limit
    );
    res.status(200).json({ posts });
  })
);

export default router;
