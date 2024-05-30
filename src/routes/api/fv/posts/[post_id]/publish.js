//add post method
import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import postsService from "services/post.service";
import tsv from "type-standard-validator";
import * as cheerio from "cheerio";

const router = new AdvancedRouter();

router.middleware.POST(isAuthenticated);

router.POST(
  new AdvancedHandler({
    params: tsv.object({
      post_id: tsv.string(),
    }),
  }).route(async (req, res) => {
    const post = await postsService.getPostById({ postId: req.params.post_id });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.published)
      return res.status(400).json({ message: "Post is already published" });
    if (String(post.author?._id ?? post?.author) !== String(req.user._id))
      return res.status(403).json({ message: "Unauthorized" });

    if (!post.thumbnail)
      return res
        .status(400)
        .json({ message: "Post must have at least 1 image" });

    if (!post.title || !post.content)
      return res
        .status(400)
        .json({ message: "Post must have title and content" });

    if (!post.description)
      return res.status(400).json({ message: "Post must have description" });

    if (post.symbolTags.length < 1)
      return res
        .status(400)
        .json({ message: "Post must have at least 1 symbol tag" });

    if (post.links.length < 1)
      return res
        .status(400)
        .json({ message: "Post must have at least 1 link" });

    if (post.branchingTags.length < 1)
      return res
        .status(400)
        .json({ message: "Post must have at least 1 branching tag" });

    let updatedPost = await postsService.publishPost({
      postId: post._id,
    });

    res.status(200).json({ post: updatedPost });
  })
);

export default router;
