import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import { PERMISSIONS } from "config/permissions";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import commentsService from "services/comment.service";
import tsv from "type-standard-validator";
import isCrmUser from "middleware/isCrmUser";
import { mongooseIdValidator } from "utils/validation";

const router = new AdvancedRouter();

router.middleware.all(isCrmUser);

router.middleware.GET(
  hasCRMUserPermissions(PERMISSIONS.COMMENTS.view_comments)
);

router.GET(
  new AdvancedHandler({
    params: tsv.object({
      post_id: tsv.string().custom(mongooseIdValidator),
    }),
    query: tsv.object({
      page: tsv.number().optional(),
      limit: tsv.number().optional(),
    }),
  }).route(async (req, res) => {
    let result = await commentsService.getAllComments({
      page: req.query.page,
      limit: req.query.limit,
      postId: req.params.post_id,
    });
    res.status(200).json({ comments: result });
  })
);

export default router;
