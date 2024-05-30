import mongoose from "mongoose";
const { Schema } = mongoose;
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const UserFollowsUserSchema = new Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    following: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

UserFollowsUserSchema.plugin(paginate);
UserFollowsUserSchema.plugin(aggregatePaginate);

export default mongoose.model("UserFollowsUser", UserFollowsUserSchema);
