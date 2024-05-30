import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import postsService from "services/post.service";
import tsv from "type-standard-validator";
import upload from "config/multer_config";
import { mongooseIdValidator } from "utils/validation";
import checkAuth from "middleware/checkAuth";

const router = new AdvancedRouter();

router.middleware.PUT([isAuthenticated]);

router.PUT(
  new AdvancedHandler({
    body: tsv.object({
      title: tsv.string(),
      content: tsv.string(),
      symbolTags: tsv.array(tsv.string()),
      hashTags: tsv.array(tsv.string()),
      direction: tsv.string(),
      links: tsv.array(
        tsv.object({
          name: tsv.string(),
          link: tsv.string(),
          _id: tsv.string().optional(),
        })
      ),
    }),
    params: tsv.object({
      post_id: tsv.string().custom(mongooseIdValidator),
    }),
  }).route(async (req, res) => {
    let post = await postsService.updatePost({
      user: req.user._id,
      postId: req.params.post_id,
      title: req.body.title,
      content: req.body.content,
      symbolTags: req.body.symbolTags ?? [],
      direction: req.body.direction,
      links: req.body.links,
      hashTags: req.body.hashTags ?? [],
    });

    res.status(200).json({ post });
  })
);

router.middleware.DELETE(isAuthenticated);

router.DELETE(
  new AdvancedHandler({}).route(async (req, res) => {
    let post = await postsService.deletePost({
      user: req.user._id,
      postId: req.params.post_id,
    });
    res.status(200).json({ post });
  })
);

router.middleware.GET(checkAuth);

router.GET(
  new AdvancedHandler({
    params: tsv.object({
      post_id: tsv.string().custom(mongooseIdValidator),
    }),
  }).route(async (req, res) => {
    let post = await postsService.getPostById({
      postId: req.params.post_id,
    });

    let isReported = await postsService.isPostReported({
      postId: req.params.post_id,
    });

    let isLiked = await postsService.hasLikedPost({
      postId: post.id,
      userId: req?.user?._id ?? null,
    });

    post = {
      ...post?._doc,
      isReported: isReported.length > 0 ? true : false,
      hasLiked: isLiked ? true : false,
    };

    res.status(200).json({ post });
  })
);

export default router;
