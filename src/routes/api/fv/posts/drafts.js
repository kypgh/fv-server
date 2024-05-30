import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import postsService from "services/post.service";
import tsv from "type-standard-validator";

const router = new AdvancedRouter();

router.middleware.GET([isAuthenticated]);

router.GET(
  new AdvancedHandler({
    query: tsv.object({
      page: tsv.number().optional(),
      limit: tsv.number().optional(),
    }),
  }).route(async (req, res) => {
    const draftPosts = await postsService.getUsersDraftPosts(
      req.user._id,
      req.query ?? {}
    );
    res.status(200).json({ posts: draftPosts });
  })
);

export default router;
