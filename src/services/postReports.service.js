import postReportsModel from "models/postReports";
import HTTPError from "utils/HTTPError";

const postsReportsService = {
  getPostsReports: async ({ page, limit, postId }) => {
    const query = {};
    if (postId) {
      query.postId = postId;
    }
    const options = {
      page: page || 1,
      limit: limit || 10,
    };
    return await postReportsModel.paginate(query, options);
  },
  updatePostReport: async ({ postReport, description, viewed }) => {
    let postReportDoc = await postReportsModel.findById(postReport);

    if (!postReportDoc) {
      throw new HTTPError("Post report not found", 404);
    }

    return postReportsModel.findByIdAndUpdate(
      postReport,
      { description, viewed },
      { new: true }
    );
  },
  deletePostReport: async ({ postReport }) => {
    let postReportDoc = await postReportsModel.findById(postReport);

    if (!postReportDoc) {
      throw new HTTPError("Post report not found", 404);
    }

    return postReportsModel.findByIdAndDelete(postReport);
  },
};

export default postsReportsService;
