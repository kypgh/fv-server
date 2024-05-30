import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import postsService from "services/post.service";
import tsv from "type-standard-validator";
import commentsService from "services/comment.service";
import { mongooseIdValidator } from "utils/validation";

const router = new AdvancedRouter();

router.GET(
  new AdvancedHandler({
    query: tsv.object({
      post_id: tsv.string().optional().custom(mongooseIdValidator),
      page: tsv.number().optional(),
      limit: tsv.number().optional(),
    }),
  }).route(async (req, res) => {
    let { post_id, page, limit } = req.query;
    let comments = await commentsService.getAllComments({
      post_id,
      page,
      limit,
    });
    res.status(200).json({ comments });
  })
);

export default router;
