import mongoose from "mongoose";
const { Schema } = mongoose;
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentsSchema = new Schema(
  {
    message: { type: String, required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Posts" },
  },
  {
    timestamps: true,
  }
);

CommentsSchema.plugin(paginate);
CommentsSchema.plugin(aggregatePaginate);

export default mongoose.model("Comments", CommentsSchema);
