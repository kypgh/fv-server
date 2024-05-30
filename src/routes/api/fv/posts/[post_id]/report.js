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
    body: tsv.object({
      description: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { description } = req.body;
    let { post_id } = req.params;
    let user = req.user._id;

    let result = await postsService.reportPost({
      user,
      postId: post_id,
      description,
    });

    res.status(200).json({ message: "Post Reported" });
  })
);

export default router;
