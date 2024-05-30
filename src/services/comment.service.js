import CommentsModel from "models/comments";
import mongoose from "mongoose";

const commentsService = {
  getAllComments: async ({ post_id, page = 1, limit = 10 }) => {
    let filters;

    if (post_id) {
      filters = { post: new mongoose.Types.ObjectId(post_id) };
    } else {
      filters = {};
    }

    let aggregation = CommentsModel.aggregate([
      {
        $match: {
          ...filters,
        },
      },
      {
        $lookup: {
          from: "replies",
          localField: "_id",
          foreignField: "comment",
          as: "replies",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "from",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            {
              $project: {
                _id: 1,
                createdAt: 1,
                updatedAt: 1,
                message: 1,
                from: {
                  _id: "$user._id",
                  userName: "$user.userName",
                  fullName: "$user.fullName",
                  avatar: "$user.avatar",
                },
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "users", // replace with your actual user collection name
          localField: "from",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user", // Assuming there is only one user for each comment
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          message: 1,
          from: {
            _id: "$user._id",
            userName: "$user.userName",
            fullName: "$user.fullName",
            avatar: "$user.avatar",
          },
          replies: {
            _id: 1,
            createdAt: 1,
            updatedAt: 1,
            from: 1,
            message: 1,
          },
        },
      },
    ]);

    let commentsWithReplies = await CommentsModel.aggregatePaginate(
      aggregation,
      {
        page,
        limit,
      }
    );

    return commentsWithReplies;
  },
};

export default commentsService;
