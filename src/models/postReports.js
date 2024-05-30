import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const { Schema } = mongoose;

const PostReportsSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    viewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

PostReportsSchema.plugin(paginate);
PostReportsSchema.plugin(aggregatePaginate);

export default mongoose.model("PostReports", PostReportsSchema);
