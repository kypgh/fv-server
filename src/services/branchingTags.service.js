import BranchingTagsModel from "models/branchingTags";

const branchingTagsService = {
  searchTags: async ({ search }) => {
    if (!search) {
      let query = await BranchingTagsModel.find({}).select({ name: 1, _id: 0 });
      return query;
    }

    const minScoreThreshold = 1;
    return BranchingTagsModel.aggregate([
      {
        $search: {
          index: "custom",
          text: {
            query: search,
            path: "name",
            fuzzy: {
              maxEdits: 1,
              maxExpansions: 2,
            },
            score: {
              boost: {
                value: 5,
              },
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
      let tag = await BranchingTagsModel.findOne({ name: element });
      if (!tag) {
        tag = await BranchingTagsModel.create({ name: element });
      }
    }

    return await BranchingTagsModel.find({ name: { $in: tags } }).select({
      _id: 1,
    });
  },
  getAllBranchingTags: async () => {
    return await BranchingTagsModel.find({}).select({ name: 1, _id: 1 });
  },
};

export default branchingTagsService;
