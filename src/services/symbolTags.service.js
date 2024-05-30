import SymbolTagsModel from "models/symbolTags";
import PostsModel from "models/posts";
import HTTPError from "utils/HTTPError";

const symbolTagsService = {
  searchTags: async ({ search }) => {
    if (!search) {
      let query = await SymbolTagsModel.find({}).select({ name: 1, _id: 0 });
      return query;
    }

    const minScoreThreshold = 0.5;
    return SymbolTagsModel.aggregate([
      {
        $search: {
          index: "symbolTagsIndex",
          text: {
            query: search,
            path: "name",
            fuzzy: {
              maxEdits: 2,
              maxExpansions: 3,
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          score: {
            $meta: "searchScore",
          },
        },
      },
      {
        $match: {
          score: {
            $gte: minScoreThreshold,
          },
        },
      },
      {
        $sort: {
          score: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          name: 1,
        },
      },
    ]);
  },
  findORCreateTag: async (tags) => {
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index];
      let tag = await SymbolTagsModel.findOne({ name: element });
      if (!tag) {
        tag = await SymbolTagsModel.create({ name: element });
      }
    }

    return await SymbolTagsModel.find({ name: { $in: tags } }).select({
      _id: 1,
    });
  },
  getAllSymbolTags: async () => {
    return SymbolTagsModel.find({});
  },
  createSymbolTag: async ({ name, category }) => {
    return SymbolTagsModel.create({ name, category });
  },
  updateSymbolTag: async ({ symbolTagId, name, category }) => {
    return SymbolTagsModel.findByIdAndUpdate(
      symbolTagId,
      { name, category },
      { new: true }
    );
  },
  deleteSymbolTag: async ({ symbolTagId }) => {
    //check first if the tag is used in any post
    let posts = await PostsModel.find({ symbolTags: { $in: [symbolTagId] } });
    if (posts.length > 0) {
      throw new HTTPError("Tag is used in posts", 400);
    }

    let tag = await SymbolTagsModel.findById(symbolTagId);

    if (!tag) {
      throw new HTTPError("Tag not found", 404);
    }

    await SymbolTagsModel.findByIdAndDelete(symbolTagId);

    return "deleted successfully";
  },
};

export default symbolTagsService;
