import PostsModel from "models/posts";
import LikePostModel from "models/postLikes";
import CommentsModel from "models/comments";
import RepliesModel from "models/replies";
import BranchingTagsModel from "models/branchingTags";
import SymbolTagsModel from "models/symbolTags";
import mongoose from "mongoose";
import HTTPError from "utils/HTTPError";
import { load as CheerioLoad } from "cheerio";
import HashTagsModel from "models/hashTags";
import postReportsModel from "models/postReports";
import postReportsModel from "models/postReports";

const postsService = {
  createPost: async ({ userId }) => {
    let branchingTag = await BranchingTagsModel.findOne({
      name: "Trading Idea",
    });

    return PostsModel.create({
      author: new mongoose.Types.ObjectId(userId),
      branchingTags: [branchingTag._id],
    });
  },
  getAllPosts: async ({
    page = 1,
    limit = 10,
    user_id,
    symbolTags,
    authUserId,
    category,
    symbol,
    start,
    end,
    sort,
  }) => {
    let filters = { archived: false, published: true };

    if (user_id) {
      filters.author = new mongoose.Types.ObjectId(user_id);
    }

    let query = [
      {
        $match: filters,
      },
      {
        $lookup: {
          from: "postlikes",
          localField: "_id",
          foreignField: "postId",
          as: "likesDocs",
          pipeline: [],
        },
      },
      {
        $addFields: {
          likes: { $size: "$likesDocs" },
          hasLiked: {
            $in: [
              new mongoose.Types.ObjectId(
                authUserId ?? "000000000000000000000000"
              ),
              "$likesDocs.userId",
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "commentsDocs",
        },
      },
      {
        $addFields: {
          comments: { $size: "$commentsDocs" }, // Count total comments
        },
      },
      {
        $lookup: {
          from: "branchingtags",
          localField: "branchingTags",
          foreignField: "_id",
          as: "branchingTags",
        },
      },
      {
        $lookup: {
          from: "symboltags",
          localField: "symbolTags",
          foreignField: "_id",
          as: "symbolTags",
        },
      },
      {
        $project: {
          likesDocs: 0,
          commentsDocs: 0,
        },
      },
    ];

    let userFilters = {};
    if (category) {
      userFilters["symbolTags.category"] = category;
    }

    if (symbol) {
      let symbols = symbol.split(",").map((item) => item.toUpperCase());
      userFilters["symbolTags.name"] = { $in: symbols };
    }

    if (start) {
      userFilters["createdAt"] = { $gte: new Date(start) };
    }
    if (end) {
      if (!userFilters["createdAt"]) userFilters["createdAt"] = {};
      userFilters["createdAt"] = { $lte: new Date(end) };
    }

    if (Object.keys(userFilters).length > 0) {
      query.push({
        $match: userFilters,
      });
    }

    if (sort) {
      const [fieldName, order] = sort.split(":");
      const sortOrder = order === "asc" ? 1 : -1;

      query.push({
        $sort: {
          [fieldName]: sortOrder,
        },
      });
    }
    let aggregation = PostsModel.aggregate(query);

    return PostsModel.aggregatePaginate(aggregation, {
      page: page,
      limit: limit,
    }).then((res) => {
      res.docs = res.docs.map((post) => {
        post.author = post.author[0];
        return post;
      });
      return res;
    });
  },
  getPostById: async ({ postId }) => {
    if (!postId) {
      throw new HTTPError("Post not found", 404);
    }
    return PostsModel.findOne({ _id: postId, archived: false }).populate(
      "author symbolTags branchingTags"
    );
  },
  getUsersDraftPosts: async (userId, { page = 1, limit = 50 }) => {
    return PostsModel.paginate(
      {
        author: userId,
        published: false,
        archived: false,
      },
      {
        page: page,
        limit: limit,
        populate: "author symbolTags branchingTags",
      }
    );
  },
  getPostByIdWithCommentsAndReplys: async ({ postId }) => {
    if (!postId) {
      const error = new Error("Post not found");
      error.status = 404;
      throw error;
    }

    return PostsModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(postId),
          archived: false,
        },
      },
      {
        $lookup: {
          from: "branchingtags",
          localField: "branchingTags",
          foreignField: "_id",
          as: "branchingTags",
        },
      },
      {
        $lookup: {
          from: "symboltags",
          localField: "symbolTags",
          foreignField: "_id",
          as: "symbolTags",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
          pipeline: [
            {
              $lookup: {
                from: "replies",
                localField: "_id",
                foreignField: "comment",
                as: "replies",
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $project: {
                _id: 0,
                userName: 1,
                fullName: 1,
                avatar: 1,
                socialMediaLinks: 1,
                description: 1,
                email: 1,
                isVerified: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          author: 1,
          links: 1,
          sections: 1,
          comments: 1,
          branchingTags: 1,
          symbolTags: 1,
          fundamentalAnalysis: 1,
          branchingTags: 1,
          symbolTags: 1,
          archived: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
  },
  likePost: async (userId, postId) => {
    let post = await PostsModel.findOne({ _id: postId });

    if (!post) {
      throw new HTTPError("Post not found", 404);
    }

    let postWithLike = await LikePostModel.findOne({
      postId,
      userId,
    });

    if (postWithLike) {
      return await LikePostModel.deleteOne({
        postId,
        userId,
      });
    } else {
      return await LikePostModel.create({
        postId,
        userId,
      });
    }
  },
  addComment: async ({ message, user, post }) => {
    let postExists = await PostsModel.findOne({ _id: post });

    if (!postExists) {
      throw new HTTPError("Post not found", 404);
    }

    return await CommentsModel.create({ message, from: user, post });
  },
  addReply: async ({ message, user, comment }) => {
    let commentExists = await CommentsModel.findOne({ _id: comment });

    if (!commentExists) {
      throw new HTTPError("Email Already Verified", 409);
    }

    return RepliesModel.create({ message, from: user, comment });
  },
  updatePost: async ({
    user,
    postId,
    title,
    content,
    symbolTags,
    direction,
    links,
    hashTags,
  }) => {
    let post = await PostsModel.findOne({ _id: postId });
    if (!post) {
      throw new HTTPError("Post not found", 404);
    }

    if (post.author != user) {
      throw new HTTPError("Unauthorized", 401);
    }

    if (post.published) {
      throw new HTTPError("Post is already published", 409);
    }

    if (hashTags && hashTags.length > 0) {
      post.hashTags = [];
      for (const hashTag of hashTags) {
        let tag = await HashTagsModel.findOne({ name: hashTag });
        if (!tag) {
          tag = await HashTagsModel.create({ name: hashTag });
        }
        post.hashTags.push(tag._id);
      }
    }

    post.title = title;
    post.content = content;
    if (content && content.length > 0) {
      let $ = CheerioLoad(content);
      let imgs = $("img");
      if (imgs.length > 0) {
        post.thumbnail = $(imgs[0]).attr("src");
      }

      post.description = $("*")
        .contents()
        .map(function () {
          return this.type === "text" ? $(this).text().trim() : "";
        })
        .get()
        .join(" ");
    }
    post.direction = direction;
    post.links = links;
    post.symbolTags = [];
    for (const symbolTag of symbolTags) {
      if (symbolTag.length === 0) continue;
      let tag = await SymbolTagsModel.findOne({ name: symbolTag });
      if (!tag) {
        continue;
      }
      post.symbolTags.push(tag._id);
    }

    return post.save();
  },
  publishPost: async ({ postId }) => {
    return PostsModel.findOneAndUpdate(
      {
        _id: postId,
        published: false,
        archived: false,
      },
      {
        $set: {
          published: true,
        },
      },
      { new: true }
    );
  },
  deletePost: async ({ user, postId }) => {
    let post = await PostsModel.findOne({ _id: postId });

    if (!post) {
      const error = new Error("Post not found");
      error.status = 404;
      throw error;
    }

    if (post.author != user) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    post.archived = true;
    return post.save();
  },
  deletePostDashBoard: async ({ postId, archiveReason }) => {
    let post = await PostsModel.findById(postId);
    if (!post) {
      throw new HTTPError("Post not found", 404);
    }

    post.archived = true;
    post.archiveReason = archiveReason;
    return post.save();
  },
  findEmptyPostForUser: async ({ userId }) => {
    return PostsModel.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
          archived: false,
        },
      },
      {
        $addFields: {
          isEmpty: { $eq: ["$createdAt", "$updatedAt"] },
        },
      },
      { $match: { isEmpty: true } },
    ]).then((res) => res[0]);
  },
  reportPost: async ({ user, postId, description }) => {
    let hasReport = await postReportsModel.findOne({
      userId: user,
      postId,
    });

    if (hasReport) {
      throw new HTTPError("You have already reported this post", 409);
    }

    return postReportsModel.create({
      userId: user,
      postId,
      description,
    });
  },
  isPostReported: async ({ postId }) => {
    return postReportsModel.find({ postId });
  },
  getReportedPosts: async ({ page = 1, limit = 10 }) => {
    let aggregation = PostsModel.aggregate([
      {
        $lookup: {
          from: "postreports",
          localField: "_id",
          foreignField: "postId",
          as: "reports",
        },
      },
      {
        $addFields: {
          numberOfReports: { $size: "$reports" },
        },
      },
      {
        $addFields: {
          reports: { $slice: ["$reports", 5] },
        },
      },
      {
        $match: {
          numberOfReports: { $gt: 0 },
        },
      },
    ]);

    return PostsModel.aggregatePaginate(aggregation, {
      page: page,
      limit: limit,
    });
  },
  hasLikedPost: async ({ postId, userId }) => {
    if (!userId) {
      return false;
    }

    let post = await LikePostModel.findOne({
      postId,
      userId,
    });

    if (!post) {
      return false;
    } else {
      return true;
    }
  },
};

export default postsService;
