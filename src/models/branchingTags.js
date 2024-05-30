import mongoose from "mongoose";
const { Schema } = mongoose;

const BranchingTagsSchema = new Schema(
  { name: { type: String, required: true } },
  {
    timestamps: true,
  }
);

export default mongoose.model("BranchingTags", BranchingTagsSchema);
