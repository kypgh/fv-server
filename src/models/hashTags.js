import mongoose from "mongoose";
const { Schema } = mongoose;

const HashTagsSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("HashTags", HashTagsSchema);
