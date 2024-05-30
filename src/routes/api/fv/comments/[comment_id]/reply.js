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
      comment_id: tsv.string(),
    }),
    body: tsv.object({
      message: tsv.string(),
    }),
  }).route(async (req, res) => {
    let reply = await postsService.addReply({
      user: req.user._id,
      comment: req.params.comment_id,
      message: req.body.message,
    });
    res.status(200).json({ reply });
  })
);

export default router;
