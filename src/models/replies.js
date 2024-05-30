import mongoose from "mongoose";
const { Schema } = mongoose;

const RepliesSchema = new Schema(
  {
    message: { type: String, required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comments" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Replies", RepliesSchema);
