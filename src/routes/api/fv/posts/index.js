import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import postsService from "services/post.service";
import tsv from "type-standard-validator";
import checkAuth from "middleware/checkAuth";

const router = new AdvancedRouter();

router.middleware.POST([isAuthenticated]);

router.POST(
  new AdvancedHandler().route(async (req, res) => {
    let user = req.user;

    let newPost = await postsService.findEmptyPostForUser({
      userId: user._id,
    });

    if (!newPost) {
      newPost = await postsService.createPost({
        userId: req.user._id,
      });
    }

    res.status(200).json({ post: newPost });
  })
);

router.middleware.GET([checkAuth]);
router.GET(
  new AdvancedHandler({
    query: tsv.object({
      page: tsv.number().optional(),
      limit: tsv.number().optional(),
      user_id: tsv.string().optional(),
      category: tsv.string().optional(),
      symbol: tsv.string().optional(),
      start: tsv.number().optional(),
      end: tsv.number().optional(),
      sort: tsv.string().optional(),
    }),
  }).route(async (req, res) => {
    let { page, limit, user_id, category, symbol, start, end, sort } =
      req.query;

    let posts = await postsService.getAllPosts({
      page: page ?? 1,
      limit: limit ?? 10,
      user_id: user_id ?? null,
      authUserId: req?.user?._id ?? null,
      category: category ?? null,
      symbol: symbol ?? null,
      start: start ?? null,
      end: end ?? null,
      sort: sort ?? null,
    });
    res.status(200).json({ posts: posts });
  })
);

export default router;
