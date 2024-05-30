import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import { PERMISSIONS } from "config/permissions";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import postsService from "services/post.service";
import isCrmUser from "middleware/isCrmUser";
import tsv from "type-standard-validator";
import { mongooseIdValidator } from "utils/validation";

const router = new AdvancedRouter();
router.middleware.all(isCrmUser);
router.middleware.GET(hasCRMUserPermissions(PERMISSIONS.POSTS.get_post));

router.GET(
  new AdvancedHandler({
    params: tsv.object({
      post_id: tsv.string().custom(mongooseIdValidator),
    }),
  }).route(async (req, res) => {
    let post = await postsService.getPostById({
      postId: req.params.post_id,
    });
    res.status(200).json({ post });
  })
);

router.DELETE(
  new AdvancedHandler({
    params: tsv.object({
      post_id: tsv.string().custom(mongooseIdValidator),
    }),
    body: tsv.object({
      archiveReason: tsv.string().optional(),
    }),
  }).route(async (req, res) => {
    await postsService.deletePostDashBoard({
      postId: req.params.post_id,
      archiveReason: req.body.archiveReason,
    });
    res.status(200).json({ message: "Post deleted" });
  })
);

export default router;
