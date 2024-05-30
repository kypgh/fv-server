import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import postsService from "services/post.service";
import tsv from "type-standard-validator";

const router = new AdvancedRouter();

router.middleware.POST(isAuthenticated);

router.POST(
  new AdvancedHandler({
    params: tsv.object({
      post_id: tsv.string(),
    }),
  }).route(async (req, res) => {
    let result = await postsService.likePost(req.user._id, req.params.post_id);
    res.status(200).json({ message: result });
  })
);

export default router;
