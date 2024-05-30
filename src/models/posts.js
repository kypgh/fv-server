import mongoose from "mongoose";
import "./users";
import "./symbolTags";
import "./branchingTags";
const { Schema } = mongoose;
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const sectionSchema = new mongoose.Schema({
  text: String,
  image: String,
});

const PostsSchema = new Schema(
  {
    title: { type: String, default: "" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    direction: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    symbolTags: [
      { type: mongoose.Schema.Types.ObjectId, ref: "SymbolTags", default: [] },
    ],
    branchingTags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BranchingTags",
        default: [],
      },
    ],
    description: { type: String, default: "" },
    content: { type: String, default: "" },
    hashTags: [{ type: String, default: [], ref: "HashTags" }],
    links: [
      {
        _id: false,
        name: { type: String },
        link: { type: String },
      },
    ],
    verified: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    archiveReason: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

PostsSchema.plugin(paginate);
PostsSchema.plugin(aggregatePaginate);

export default mongoose.model("Posts", PostsSchema);
